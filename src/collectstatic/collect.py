#!/usr/bin/env python3

"""
Polls some directories and copies the contents found there to another
directory, including the file hash in the filename.

Polls every 5 seconds so that we can use this thing during development,
which is absolutely crazy.
"""

import os
import time
import hashlib
import shutil
import json
import pathlib


INPUT_BASEDIR = '/static'
OUTPUT_BASEDIR = '/code/output'
DEBUG = os.environ.get('DEBUG') == '1'


def get_file_hash(fpath):
    with open(fpath, "rb") as f:
        thebytes = f.read()
    return hashlib.md5(thebytes).hexdigest()


def process_file(fpath):
    hashval = get_file_hash(fpath)
    relative_fpath = fpath[len(INPUT_BASEDIR) + 1:]
    (basedir, fname) = os.path.split(relative_fpath)
    (basename, ext) = os.path.splitext(fname)
    newname = f"{basename}.{hashval}{ext}"
    newpath = os.path.join(OUTPUT_BASEDIR, basedir, newname)
    new_nonhashed_path = os.path.join(OUTPUT_BASEDIR, basedir, fname)
    newdir = os.path.split(newpath)[0]
    pathlib.Path(newdir).mkdir(parents=True, exist_ok=True)
    shutil.copyfile(fpath, newpath)
    shutil.copyfile(fpath, new_nonhashed_path)
    print(f"{fpath} => {newdir}/{basename}{{,.{hashval}}}{ext}")
    return (fpath, newpath)


def write_manifest(processed_files):
    paths = {}
    for (orig, new) in processed_files:
        orig_clean = orig[len(INPUT_BASEDIR):]
        new_clean = new[len(OUTPUT_BASEDIR):]
        paths[orig_clean] = new_clean
    data = {"paths": paths}
    outfile = os.path.join(OUTPUT_BASEDIR, "staticfiles.json")
    with open(outfile, "w") as f:
        f.write(json.dumps(data))
    print(f"Wrote {len(processed_files)} entries to {outfile}")


def collectstatic():
    processed_files = []
    print("Collecting statics")
    for (dirpath, dirnames, filenames) in os.walk(INPUT_BASEDIR):
        for fname in filenames:
            (base, ext) = os.path.splitext(fname)
            if not ext:
                print(f"Skipping non-extensioned file {fname}")
                continue
            fpath = os.path.join(dirpath, fname)
            newfile = process_file(fpath)
            processed_files.append(newfile)
    write_manifest(processed_files)


if __name__ == "__main__":
    collectstatic()
