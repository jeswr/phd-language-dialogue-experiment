docker build . -t shacl2shex
docker create --name shacl2shex shacl2shex
docker cp shacl2shex:/root/shaclex/examples/shacl/good1.shex ./good1.shex
docker rm shacl2shex
