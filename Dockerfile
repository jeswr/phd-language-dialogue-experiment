FROM sbtscala/scala-sbt:eclipse-temurin-17.0.4_1.7.1_3.2.0

RUN git clone --depth 1 --branch v0.2.2 https://github.com/weso/shaclex
WORKDIR /root/shaclex
RUN sbt compile
CMD [ "sbt", "run --schema /shape.ttl \
           --schemaFormat Turtle \
           --outSchemaFormat ShExC \ 
           --engine SHACLEX \
           --outEngine SHEX  \
           --showSchema \
           --no-validate" ]
