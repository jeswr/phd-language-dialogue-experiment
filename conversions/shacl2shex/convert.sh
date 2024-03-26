for file in ./shapes/*.ttl; do
    filename=$(basename "$file")
    filename="${filename%.*}"
    docker run -v "$file":/shape.ttl jeswr/shacl2shex > ./shapes/"$filename".shex
    sed -i '1,22d;$d' ./shapes/"$filename".shex
    sed -i 's/^.\{7\}//' ./shapes/"$filename".shex
done
