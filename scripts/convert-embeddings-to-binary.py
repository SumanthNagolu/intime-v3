#!/usr/bin/env python3
"""
Convert RAG embeddings from JSON to binary Float32 format.

Input:  data/rag-knowledge-base/embeddings.json  (~2.1 GB)
Output: data/rag-knowledge-base/embeddings.bin   (~390 MB)
        data/rag-knowledge-base/embeddings-ids.json (ID→index mapping)

Binary format: raw Float32Array buffer, each embedding is 1536 floats (6144 bytes).
Embedding i starts at byte offset i * 1536 * 4.
"""

import json
import struct
import sys
import os
import time

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'rag-knowledge-base')
EMBEDDINGS_JSON = os.path.join(DATA_DIR, 'embeddings.json')
EMBEDDINGS_BIN = os.path.join(DATA_DIR, 'embeddings.bin')
EMBEDDINGS_IDS = os.path.join(DATA_DIR, 'embeddings-ids.json')
DIMS = 1536


def main():
    if not os.path.exists(EMBEDDINGS_JSON):
        print(f"Error: {EMBEDDINGS_JSON} not found")
        sys.exit(1)

    print(f"Loading {EMBEDDINGS_JSON}...")
    t0 = time.time()

    with open(EMBEDDINGS_JSON, 'r') as f:
        embeddings_list = json.load(f)

    print(f"  Loaded {len(embeddings_list)} embeddings in {time.time() - t0:.1f}s")

    # Build ID mapping and binary buffer
    ids = []
    total = len(embeddings_list)

    print(f"Writing binary to {EMBEDDINGS_BIN}...")
    t1 = time.time()

    with open(EMBEDDINGS_BIN, 'wb') as bf:
        for i, entry in enumerate(embeddings_list):
            ids.append(entry['id'])
            vec = entry['embedding']

            if len(vec) != DIMS:
                print(f"  Warning: chunk {entry['id']} has {len(vec)} dims (expected {DIMS}), padding/truncating")
                if len(vec) < DIMS:
                    vec = vec + [0.0] * (DIMS - len(vec))
                else:
                    vec = vec[:DIMS]

            bf.write(struct.pack(f'{DIMS}f', *vec))

            if (i + 1) % 10000 == 0 or i == total - 1:
                pct = (i + 1) / total * 100
                print(f"  {i + 1}/{total} ({pct:.1f}%)")

    print(f"  Done in {time.time() - t1:.1f}s")

    # Write ID mapping
    print(f"Writing ID mapping to {EMBEDDINGS_IDS}...")
    with open(EMBEDDINGS_IDS, 'w') as f:
        json.dump(ids, f)

    # Report sizes
    json_size = os.path.getsize(EMBEDDINGS_JSON) / (1024 ** 3)
    bin_size = os.path.getsize(EMBEDDINGS_BIN) / (1024 ** 3)
    ids_size = os.path.getsize(EMBEDDINGS_IDS) / (1024 ** 2)

    print(f"\nDone!")
    print(f"  embeddings.json:     {json_size:.2f} GB")
    print(f"  embeddings.bin:      {bin_size:.2f} GB")
    print(f"  embeddings-ids.json: {ids_size:.1f} MB")
    print(f"  Compression ratio:   {bin_size / json_size:.1%}")
    print(f"  Total embeddings:    {len(ids)}")
    print(f"  Dimensions:          {DIMS}")
    print(f"  Bytes per embedding: {DIMS * 4}")


if __name__ == '__main__':
    main()
