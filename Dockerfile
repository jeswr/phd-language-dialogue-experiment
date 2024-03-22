FROM sbtscala/scala-sbt:eclipse-temurin-17.0.4_1.7.1_3.2.0

RUN git clone --depth 1 --branch v0.2.2 https://github.com/weso/shaclex
WORKDIR /root/shaclex
RUN sbt compile
RUN ls -la
RUN sbt "run --schema examples/shacl/good1.ttl \
           --schemaFormat Turtle \
           --outSchemaFormat ShExC \ 
           --engine SHACLEX \
           --outEngine SHEX  \
           --showSchema \
           --no-validate" > /root/shaclex/examples/shacl/good1.shex

# Remove the first 22 and last line of ./good1.shex
RUN sed -i '1,22d;$d' /root/shaclex/examples/shacl/good1.shex

# Remove the first 8 characters in each line of ./good1.shex
RUN sed -i 's/^.\{7\}//' /root/shaclex/examples/shacl/good1.shex
