docker build ./conversions/shacl2shex -t shacl2shex
docker create --name shacl2shex shacl2shex
for file in ./shapes/*.ttl; do
    filename=$(basename "$file")
    filename="${filename%.*}"
    docker run -v "$file":/"$filename".ttl shacl2shex > ./shapes/"$filename".shex
    sed -i '1,22d;$d' ./shapes/"$filename".shex
    sed -i 's/^.\{7\}//' ./shapes/"$filename".shex
done

docker rm shacl2shex
