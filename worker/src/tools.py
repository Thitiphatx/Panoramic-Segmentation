import re
import subprocess
import sys
from pathlib import Path

# ตัดเฉพาะชื่อที่ตรงเป๊ะ ไม่ตัด torchmetrics, torchsummary ฯลฯ ทิ้งไปด้วย
EXCLUDE = re.compile(r"^(torch|torchvision|torchaudio|triton)==|^(rocm|amd)", re.I)


def export_requirements() -> None:
    result = subprocess.run(
        ["uv", "pip", "freeze", "--exclude-editable", "--python", sys.executable],
        capture_output=True,
        text=True,
        check=True,
    )
    lines = [l for l in result.stdout.splitlines() if l and not EXCLUDE.match(l)]
    Path("requirements.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote requirements.txt ({len(lines)} packages)")