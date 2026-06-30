# SERVER-121912: MongoDB 8.0's vendored TCMalloc violates the rseq ABI on Linux
# kernel 6.19+, aborting mongod on startup. Disabling the SHSTK CPU hwcap works
# around it; harmless on older kernels. Drop once MongoDB ships the TCMalloc fix.
docker run -t -v "$(pwd)/mongo_volume":/data/db -e GLIBC_TUNABLES=glibc.cpu.hwcaps=-SHSTK -d -p 27017:27017 mongo:8.0
