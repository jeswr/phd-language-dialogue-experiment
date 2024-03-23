FROM sbtscala/scala-sbt:eclipse-temurin-17.0.4_1.7.1_3.2.0

RUN git clone --depth 1 --branch v0.2.2 https://github.com/weso/shaclex
WORKDIR /root/shaclex
# Workaround for https://github.com/weso/shaclex/issues/637
RUN sed -i '207s/.*/ok(Some(components.collect { case shacl.MinCount(m) => m }.headOption.getOrElse(0)))/' ./modules/converter/src/main/scala/es/weso/shacl/converter/Shacl2ShEx.scala
RUN sed -i '211s/.*/ok(Some(components.collect { case shacl.MaxCount(m) => shex.IntMax(m) }.headOption.getOrElse(shex.Star)))/' ./modules/converter/src/main/scala/es/weso/shacl/converter/Shacl2ShEx.scala
RUN sbt compile
CMD [ "sbt", "run --schema /shape.ttl \
           --schemaFormat Turtle \
           --outSchemaFormat ShExC \ 
           --engine SHACLEX \
           --outEngine SHEX  \
           --showSchema \
           --no-validate" ]
