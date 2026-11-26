FROM rocm/pytorch:rocm7.14.1_ubuntu24.04_py3.12_pytorch_release_2.12.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fL https://github.com/ROCm/librocdxg/releases/download/v1.2.2/rocdxg-roct_1.2.2_amd64.deb -o /tmp/rocdxg.deb \
    && apt-get install -y /tmp/rocdxg.deb \
    && rm -f /tmp/rocdxg.deb \
    && apt-get purge -y --auto-remove curl \
    && rm -rf /var/lib/apt/lists/*

# The ROCm wheel loads the WSL bridge by name from its bundled HSA runtime.
RUN test -f /opt/rocm/lib/librocdxg.so \
    && ln -s /opt/rocm/lib/librocdxg.so /opt/venv/lib/python3.12/site-packages/_rocm_sdk_core/lib/librocdxg.so

ENV LD_LIBRARY_PATH=/opt/rocm/lib:/opt/venv/lib/python3.12/site-packages/_rocm_sdk_core/lib

WORKDIR /workspace
ENV PYTHONPATH=/workspace

COPY requirements.txt .

RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

CMD ["python3", "src/main.py"]
