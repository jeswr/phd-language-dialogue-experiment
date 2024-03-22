docker build . -t shacl2shex
docker create --name shacl2shex shacl2shex
docker run -v ./shape.ttl:/shape.ttl shacl2shex > ./shape.shex

# Remove the first 22 and last line of ./good1.shex
sed -i '1,22d;$d' ./shape.shex

# Remove the first 8 characters in each line of ./good1.shex
sed -i 's/^.\{7\}//' ./shape.shex

docker rm shacl2shex
