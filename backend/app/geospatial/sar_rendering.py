"""Cached visualization products for one registered Sentinel-1 observation."""
from __future__ import annotations

import hashlib
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image


RENDER_VERSION = "sar-visuals-v1"


def _stretch(values: np.ndarray, valid: np.ndarray) -> np.ndarray:
    output = np.zeros(values.shape, dtype=np.uint8)
    selected = values[valid & np.isfinite(values)]
    if selected.size == 0:
        return output
    low, high = np.percentile(selected, (2, 98))
    if high <= low:
        return output
    output = (np.clip((values - low) / (high - low), 0, 1) * 255).astype(np.uint8)
    output[~valid] = 0
    return output


def render_sar_visuals(sar_observation, output_dir: Path) -> dict[str, str | None]:
    """Render and cache four products from the same VV/VH source raster."""
    source_path = Path(sar_observation["tile_path"])
    if not source_path.exists():
        return {"vv_raw": None, "vh_raw": None, "rgb_ratio": None, "sar_urban": None}

    fingerprint = f"{source_path}:{source_path.stat().st_size}:{source_path.stat().st_mtime_ns}"
    cache_key = hashlib.sha256(f"{RENDER_VERSION}:{sar_observation['sar_tile_id']}:{fingerprint}".encode()).hexdigest()[:16]
    output_dir.mkdir(parents=True, exist_ok=True)
    paths = {name: output_dir / f"sar-{cache_key}-{name}.png" for name in ("vv_raw", "vh_raw", "rgb_ratio", "sar_urban")}
    if all(path.exists() for path in paths.values()):
        return {name: str(path) for name, path in paths.items()}

    with rasterio.open(source_path) as source:
        vv = source.read(1).astype(np.float32)
        vh = source.read(2).astype(np.float32) if source.count >= 2 else None
        mask = np.isfinite(vv) & (vv != 0)
        if vh is None:
            return {name: None for name in paths}
        mask &= np.isfinite(vh) & (vh != 0)

    vv_gray = _stretch(vv, mask)
    vh_gray = _stretch(vh, mask)
    ratio = vv - vh
    ratio_gray = _stretch(ratio, mask)
    rgb = np.stack((vv_gray, vh_gray, ratio_gray), axis=-1)
    urban_threshold = float(np.percentile(ratio[mask], 70)) if mask.any() else 0.0
    urban = np.zeros((*vv.shape, 3), dtype=np.uint8)
    background = (vv_gray.astype(np.float32) * 0.35).astype(np.uint8)
    urban[:] = background[..., None]
    urban_mask = mask & (ratio >= urban_threshold)
    urban[urban_mask] = np.stack((np.full(urban_mask.sum(), 255, dtype=np.uint8), vh_gray[urban_mask], np.zeros(urban_mask.sum(), dtype=np.uint8)), axis=-1)

    Image.fromarray(vv_gray, mode="L").save(paths["vv_raw"], format="PNG")
    Image.fromarray(vh_gray, mode="L").save(paths["vh_raw"], format="PNG")
    Image.fromarray(rgb, mode="RGB").save(paths["rgb_ratio"], format="PNG")
    Image.fromarray(urban, mode="RGB").save(paths["sar_urban"], format="PNG")
    return {name: str(path) for name, path in paths.items()}