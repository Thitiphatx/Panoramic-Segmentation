# Training Setup

Install the project dependencies and AMD ROCm wheels in this order. The AMD wheels are installed separately because their ROCm-specific Triton dependency is not resolvable from the configured package index during `uv lock`.

From this directory, sync the locked project dependencies first:

```powershell
uv sync
```

Then install the AMD `gfx1200` PyTorch wheels into the project environment:

```powershell
uv pip install --index-url https://stable.repo.amd.com/rocm/whl-next/ `
  "torch[device-gfx1200]==2.14.0+rocm10.1.0" `
  "torchvision[device-gfx1200]==0.29.0a0+rocm10.1.0" `
  "torchaudio==2.11.0.3+rocm10.1.0"
```

Run inference with:

```powershell
uv run python src/training/inference.py
```

`uv run` uses inexact syncing and keeps the separately installed AMD wheels. If manually syncing later, use `uv sync --inexact` to preserve them; plain `uv sync` removes packages that are not listed in `pyproject.toml`.
