# YOLO Inference Server

The Python server that handles photo verification. Runs locally on the demo laptop; the phone reaches it through a tunnel.

## Setup (one-time)

```bash
# Create a venv (from repo root or a sibling folder)
python -m venv yolo-env
# Windows
yolo-env\Scripts\activate
# macOS/Linux
source yolo-env/bin/activate

pip install ultralytics fastapi "uvicorn[standard]" python-multipart
```

YOLOv8n weights (~6MB) auto-download on first inference call.

## The server

```python
# yolo_server.py
import logging
import time
from fastapi import FastAPI, UploadFile, HTTPException
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("yolo")

app = FastAPI()
model = YOLO("yolov8n.pt")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/detect")
async def detect(file: UploadFile):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "file must be an image")
    start = time.time()
    img_bytes = await file.read()
    tmp_path = "/tmp/yolo_in.jpg"
    with open(tmp_path, "wb") as f:
        f.write(img_bytes)
    try:
        results = model(tmp_path)[0]
    except Exception as e:
        log.exception("inference failed")
        raise HTTPException(500, f"inference failed: {e}")
    classes = [results.names[int(c)] for c in results.boxes.cls]
    confidences = [float(c) for c in results.boxes.conf]
    latency_ms = int((time.time() - start) * 1000)
    log.info("detect classes=%s latency_ms=%d", classes, latency_ms)
    return {"classes": classes, "confidences": confidences, "latency_ms": latency_ms}
```

## Running

```bash
uvicorn yolo_server:app --host 0.0.0.0 --port 8000
```

Bind to `0.0.0.0`, not `127.0.0.1`, so the tunnel tool can reach it.

## Exposing to the phone

Expo Go uses `--tunnel` mode, so the phone is not on the same network as the laptop. The YOLO server needs its own tunnel.

### Preferred: Cloudflare Tunnel

No account required.

```bash
# One-time install (Windows)
winget install --id Cloudflare.cloudflared

# Start the tunnel
cloudflared tunnel --url http://localhost:8000
```

Copy the generated HTTPS URL (looks like `https://abc-def-ghi.trycloudflare.com`) into `src/config/yolo.ts` in the app.

### Fallback: ngrok

```bash
ngrok http 8000
```

Requires a free ngrok account.

### Fallback: LAN mode

If the Wi-Fi allows peer connections, switch Expo to `--lan`:

```bash
npx expo start --lan
```

Then use `http://<laptop-ip>:8000` from the app — no tunnel needed.

## Verifying it works

From the laptop:

```bash
curl http://localhost:8000/health
# → {"ok":true}

curl -X POST -F "file=@test.jpg" http://localhost:8000/detect
# → {"classes":["person","dog"],"confidences":[0.91,0.84],"latency_ms":180}
```

From the phone (via tunnel URL):

```bash
curl https://<tunnel-url>/health
```

Should return the same JSON. If not, the tunnel is down.

## Performance

YOLOv8n on a modern laptop CPU: 50–200ms per image. Well under the 3-second target.

If you have an Nvidia GPU and installed `torch` with CUDA, it drops to ~20ms. Not required.

## Common issues

- **"Cannot reach server"** from the app → tunnel died, restart `cloudflared`
- **First detection slow** → weights downloading, check server logs
- **`Permission denied`** writing to `/tmp/` on Windows → change the temp path to `tempfile.gettempdir()`
- **iOS Expo Go rejects the request** → tunnel URL must be HTTPS (Cloudflare gives HTTPS automatically; ngrok too)
