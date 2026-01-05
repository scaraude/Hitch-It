#!/usr/bin/env python3
"""
Import and cluster hitchhiking spots from raw database.

Usage:
    python scripts/import_spots.py --input data/spots.csv --dry-run
    python scripts/import_spots.py --input data/spots.sqlite --output spots_clustered.json
    python scripts/import_spots.py --input data/spots.csv --upload

Requirements:
    pip install pandas scikit-learn hdbscan requests python-dotenv supabase
"""

import argparse
import json
import sqlite3
import time
import uuid
from datetime import datetime
from pathlib import Path

import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
import requests

# =============================================================================
# CONFIGURATION - Tweak these parameters
# =============================================================================

CONFIG = {
    # Clustering parameters
    "cluster_min_distance_km": 0.3,  # Points within this distance may cluster
    "cluster_min_samples": 2,        # Min points to form a cluster

    # Scoring weights
    "weight_rating": 0.1,            # Original rating importance
    "weight_recency": 0.6,           # Recent = better
    "weight_isolation": 0.3,         # Isolated points = more valuable

    # Filtering
    "min_rating": 1.0,               # Exclude low ratings
    "exclude_banned": True,
    "only_reviewed": False,          # Set True to only keep reviewed spots
    "country_filter": None,          # e.g., "FR" or None for all
    "min_date": None,                # e.g., "2022-01-01" or None
    "only_with_direction": True,    # Only keep spots with direction info

    # Reverse geocoding
    "geocoding_enabled": False,      # Enable to fetch road names (slow!)
    "geocoding_delay_sec": 1.1,      # Nominatim rate limit: 1 req/sec

    # Output
    "max_spots": None,               # Limit output (None = all)
}

# =============================================================================
# DATA LOADING
# =============================================================================

def load_data(input_path: str) -> pd.DataFrame:
    """Load data from CSV or SQLite."""
    path = Path(input_path)

    if path.suffix == ".csv":
        df = pd.read_csv(path, low_memory=False)
    elif path.suffix in (".sqlite", ".db"):
        conn = sqlite3.connect(path)
        df = pd.read_sql("SELECT * FROM point", conn)  # Adjust table name if needed
        conn.close()
    else:
        raise ValueError(f"Unsupported format: {path.suffix}")

    print(f"Loaded {len(df)} raw points from {path.name}")
    return df


def filter_data(df: pd.DataFrame) -> pd.DataFrame:
    """Apply filtering based on CONFIG."""
    initial = len(df)

    # Remove invalid coordinates
    df = df.dropna(subset=["lat", "lon"])
    df = df[(df["lat"].between(-90, 90)) & (df["lon"].between(-180, 180))]

    # Apply filters
    if CONFIG["exclude_banned"]:
        df = df[df["banned"] != 1]

    if CONFIG["only_reviewed"]:
        df = df[df["reviewed"] == 1]

    if CONFIG["min_rating"]:
        df = df[df["rating"] >= CONFIG["min_rating"]]

    if CONFIG["country_filter"]:
        df = df[df["country"] == CONFIG["country_filter"]]
    
    if CONFIG["min_date"]:
        cutoff = pd.to_datetime(CONFIG["min_date"])
        df["parsed_date"] = pd.to_datetime(df["datetime"], errors='coerce')
        df = df[df["parsed_date"] >= cutoff]

    if CONFIG["only_with_direction"]:
        df = df.dropna(subset=["dest_lat", "dest_lon"])

    print(f"Filtered: {initial} → {len(df)} points")
    return df.reset_index(drop=True)


# =============================================================================
# CLUSTERING
# =============================================================================

def haversine_km(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two points."""
    R = 6371  # Earth radius in km
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    return 2 * R * np.arcsin(np.sqrt(a))


def cluster_points(df: pd.DataFrame) -> pd.DataFrame:
    """Apply DBSCAN clustering to group nearby spots."""
    coords = df[["lat", "lon"]].values

    # Convert km to radians for haversine metric
    epsilon_rad = CONFIG["cluster_min_distance_km"] / 6371

    clusterer = DBSCAN(
        eps=epsilon_rad,
        min_samples=CONFIG["cluster_min_samples"],
        metric="haversine",
    )

    # DBSCAN expects radians for haversine
    coords_rad = np.radians(coords)
    df["cluster_id"] = clusterer.fit_predict(coords_rad)

    n_clusters = df["cluster_id"].max() + 1
    n_noise = (df["cluster_id"] == -1).sum()
    print(f"Clustering: {n_clusters} clusters, {n_noise} isolated points")

    return df


def compute_scores(df: pd.DataFrame) -> pd.DataFrame:
    """Compute composite score for each point."""

    # Rating score (normalize to 0-1)
    max_rating = df["rating"].max() or 5
    df["score_rating"] = df["rating"].fillna(0) / max_rating

    # Recency score (exponential decay, 1 year half-life)
    def parse_date(d):
        if pd.isna(d):
            return datetime(2010, 1, 1)  # Old default
        try:
            return pd.to_datetime(d)
        except:
            return datetime(2010, 1, 1)

    df["parsed_date"] = df["datetime"].apply(parse_date)
    now = datetime.now()
    days_old = (now - df["parsed_date"]).dt.days
    df["score_recency"] = np.exp(-days_old / 365)  # Half-life ~1 year

    # Isolation score (inverse of cluster size)
    cluster_sizes = df.groupby("cluster_id").size()
    df["cluster_size"] = df["cluster_id"].map(cluster_sizes)
    df.loc[df["cluster_id"] == -1, "cluster_size"] = 1  # Noise points are isolated
    df["score_isolation"] = 1 / df["cluster_size"]

    # Composite score
    df["score_total"] = (
        CONFIG["weight_rating"] * df["score_rating"] +
        CONFIG["weight_recency"] * df["score_recency"] +
        CONFIG["weight_isolation"] * df["score_isolation"]
    )

    return df


def select_best_per_cluster(df: pd.DataFrame) -> pd.DataFrame:
    """Select the best point from each cluster."""
    # For noise points (cluster_id == -1), keep all
    noise = df[df["cluster_id"] == -1].copy()

    # For clusters, keep the best scoring point
    clustered = df[df["cluster_id"] >= 0]
    best_idx = clustered.groupby("cluster_id")["score_total"].idxmax()
    best_clustered = df.loc[best_idx].copy()

    result = pd.concat([noise, best_clustered], ignore_index=True)
    print(f"Selection: {len(df)} → {len(result)} spots (best per cluster)")

    return result

# =============================================================================
# MAPPING TO TARGET SCHEMA
# =============================================================================

def rating_to_appreciation(rating: float) -> str:
    """Convert numeric rating to appreciation enum."""
    if pd.isna(rating) or rating < 2:
        return "bad"
    elif rating < 4:
        return "good"
    else:
        return "perfect"


def compute_direction(lat: float, lon: float, dest_lat: float, dest_lon: float) -> str:
    """Compute cardinal direction from point to destination."""
    if pd.isna(dest_lat) or pd.isna(dest_lon):
        return None  # Default

    dlat = dest_lat - lat
    dlon = dest_lon - lon

    angle = np.degrees(np.arctan2(dlon, dlat))  # 0° = North, 90° = East

    # Map angle to 8 directions
    directions = [
        ("North", -22.5, 22.5),
        ("North-East", 22.5, 67.5),
        ("East", 67.5, 112.5),
        ("South-East", 112.5, 157.5),
        ("South", 157.5, 180), ("South", -180, -157.5),
        ("South-West", -157.5, -112.5),
        ("West", -112.5, -67.5),
        ("North-West", -67.5, -22.5),
    ]

    for name, low, high in directions:
        if low <= angle < high:
            return name
    return "North"


def reverse_geocode(lat: float, lon: float) -> str:
    """Get road name from coordinates using Nominatim."""
    try:
        url = f"https://nominatim.openstreetmap.org/reverse"
        params = {
            "lat": lat,
            "lon": lon,
            "format": "json",
            "zoom": 16,  # Road level
        }
        headers = {"User-Agent": "HitchIt-Importer/1.0"}

        resp = requests.get(url, params=params, headers=headers, timeout=10)
        data = resp.json()

        address = data.get("address", {})
        road = address.get("road") or address.get("pedestrian") or address.get("highway")
        return road or "Unknown road"
    except Exception as e:
        print(f"Geocoding error at {lat},{lon}: {e}")
        return "Unknown road"


def map_to_spot_schema(df: pd.DataFrame) -> list[dict]:
    """Convert dataframe to Spot schema."""
    spots = []

    for i, row in df.iterrows():
        # Reverse geocode if enabled (with rate limiting)
        if CONFIG["geocoding_enabled"]:
            road_name = reverse_geocode(row["lat"], row["lon"])
            time.sleep(CONFIG["geocoding_delay_sec"])
        else:
            road_name = "Imported spot"

        # Build destinations from dest_lat/lon if available
        destinations = []
        if pd.notna(row.get("dest_lat")) and pd.notna(row.get("dest_lon")):
            # Could reverse geocode destination too, for now just note coords
            destinations = [f"→ {row['dest_lat']:.2f}, {row['dest_lon']:.2f}"]

        spot = {
            "id": str(uuid.uuid4()),
            "latitude": float(row["lat"]),
            "longitude": float(row["lon"]),
            "appreciation": rating_to_appreciation(row["rating"]),
            "direction": compute_direction(
                row["lat"], row["lon"],
                row.get("dest_lat"), row.get("dest_lon")
            ),
            "road_name": road_name,
            "destinations": destinations,
            "created_by": "import",
            "created_at": row["parsed_date"].isoformat() if pd.notna(row.get("parsed_date")) else datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            # Metadata for debugging (won't be uploaded)
            "_original_id": int(row["id"]) if pd.notna(row.get("id")) else None,
            "_score": float(row["score_total"]),
            "_cluster_id": int(row["cluster_id"]),
            "_rating": float(row["rating"]) if pd.notna(row.get("rating")) else None,
            "_comment": row.get("comment"),
        }
        spots.append(spot)

        if CONFIG["max_spots"] and len(spots) >= CONFIG["max_spots"]:
            break

    return spots


# =============================================================================
# OUTPUT
# =============================================================================

def export_geojson(spots: list[dict], output_path: str):
    """Export spots as GeoJSON for visualization."""
    features = []
    for spot in spots:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [spot["longitude"], spot["latitude"]]
            },
            "properties": {
                "id": spot["id"],
                "created_at": spot["created_at"],
                "appreciation": spot["appreciation"],
                "direction": spot["direction"],
                "road_name": spot["road_name"],
                "score": spot.get("_score"),
                "rating": spot.get("_rating"),
                "comment": spot.get("_comment") if pd.notna(spot.get("_comment")) else None,
            }
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    with open(output_path, "w") as f:
        json.dump(geojson, f, indent=2)

    print(f"Exported {len(spots)} spots to {output_path}")


def export_json(spots: list[dict], output_path: str):
    """Export spots as JSON."""
    # Remove internal metadata
    clean_spots = [
        {k: v for k, v in spot.items() if not k.startswith("_")}
        for spot in spots
    ]

    with open(output_path, "w") as f:
        json.dump(clean_spots, f, indent=2)

    print(f"Exported {len(spots)} spots to {output_path}")


def upload_to_supabase(spots: list[dict]):
    """Upload spots to Supabase."""
    try:
        from supabase import create_client
        from dotenv import load_dotenv
        import os

        load_dotenv()

        url = os.getenv("EXPO_PUBLIC_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Need service role for bulk insert

        if not url or not key:
            print("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
            return

        client = create_client(url, key)

        # Clean spots for upload
        clean_spots = [
            {k: v for k, v in spot.items() if not k.startswith("_")}
            for spot in spots
        ]

        # Batch insert (Supabase limit is ~1000 per request)
        batch_size = 500
        for i in range(0, len(clean_spots), batch_size):
            batch = clean_spots[i:i + batch_size]
            client.table("spots").insert(batch).execute()
            print(f"Uploaded batch {i//batch_size + 1}/{(len(clean_spots)-1)//batch_size + 1}")

        print(f"Successfully uploaded {len(spots)} spots to Supabase")

    except ImportError:
        print("Error: pip install supabase python-dotenv")
    except Exception as e:
        print(f"Upload error: {e}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="Import and cluster hitchhiking spots")
    parser.add_argument("--input", "-i", required=True, help="Input CSV or SQLite file")
    parser.add_argument("--output", "-o", help="Output JSON/GeoJSON file")
    parser.add_argument("--geojson", action="store_true", help="Export as GeoJSON")
    parser.add_argument("--upload", action="store_true", help="Upload to Supabase")
    parser.add_argument("--dry-run", action="store_true", help="Process but don't export")
    parser.add_argument("--geocode", action="store_true", help="Enable reverse geocoding")
    parser.add_argument("--country", help="Filter by country code (e.g., FR, DE, ES)")
    parser.add_argument("--min-date", help="Filter by minimum date (e.g., 2020-01-01)")
    args = parser.parse_args()

    if args.geocode:
        CONFIG["geocoding_enabled"] = True
    if args.country:
        CONFIG["country_filter"] = args.country
    if args.min_date:
        CONFIG["min_date"] = args.min_date

    # Pipeline
    df = load_data(args.input)
    df = filter_data(df)
    df = cluster_points(df)
    df = compute_scores(df)
    df = select_best_per_cluster(df)

    # Sort by score
    df = df.sort_values("score_total", ascending=False)

    # Map to schema
    spots = map_to_spot_schema(df)

    print(f"\nFinal: {len(spots)} spots ready")
    print(f"Top 5 scores: {[f'{s['_score']:.2f}' for s in spots[:5]]}")

    if args.dry_run:
        print("\n[Dry run - no output]")
        return

    # Export
    if args.output:
        if args.geojson or args.output.endswith(".geojson"):
            export_geojson(spots, args.output)
        else:
            export_json(spots, args.output)

    if args.upload:
        upload_to_supabase(spots)


if __name__ == "__main__":
    main()
