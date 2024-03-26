Semantic Web technologies enable Trustworthy and Accountable conversational agents at a Web Scale.

Conversational agents are becoming an increasingly popular topic of research within the LLM community. In particular AutoGen has over 23.2k stars on GiHub and [x] citations. Devin the “worlds first AI software engineer” has received $23M in seed funding, and …

Problem Statement:
How can autonomous, semi-autonomous and other systems safely participate in interactions on the Web that have real-world outcomes.

Solution (sketch):
We propose a protocol which enables agents to negotiate and transact over the Web whilst:
 1. Unambiguosly describing usage restrictions on exhanged data in order to protect private data.
 2. Unambiguosly describing any outcomes of a dialogue that require an *agreement* or *transaction* such as having multiple Personal Assistant Agents agree on a shared event (e.g. a restaurant booking).
 3. Providing a mechanism for descrbing the origin and provenance of exchanged data when required by given agents in the exchange.

We consider [x] use cases to demonstrate 

Data Packaging:
<!-- Perhaps we can get Ruben D. to write this bit? -->

Design Considerations:
 - Questions should be placed in the data as the question itself can contain context that should be considered priviledged information.


(Protocol) Design Choices:
 - As a first pass we make use of ACP
 - For evaluating belief/trust the trust model *does not* need to be broadcast. The primary reason for broadcasting this information is
   in order to enable other agents / entites within an ecosystem to 

A basic trust ontology:
 - Whilst much more complex models such as the reference ontology of trust exist. We use the following model for describing belief in our initial architecture.

```ttl
@prefix belief: <http://example.org/trust/>

belief:believes a rdf:Property ;
    rdf:label "Believes" ;
    rdf:description "Used to indicate that an agent unconditionally believes data originating from a prescribed location" .
```

On the json schemas discussion; it might be interesting to see if we can convince the guy talking about that to, instead of using schemas,
to instead do research on "compresssing" as much language as possible to RDF and then have the rest represented in natural language.

(HTTP) Design notes:
 - For now we are expecting most key components of our infrastrucutre to have their own server, and
 we are negotiating between these components via `POST` requests.

(Human) Agent Design notes:
 - Because it has context of the task that is being worked on. The agent should be able to establish
 the priority and urgency of tasks. For low urgency tasks it should be able to allow a user to bulk
 action them (if that is how the user likes to work).


Future Work:
 - Demonstrating that data & rules are the same thing. For instance:
   - Forwarded ACLs and DToU
 - Integration with tooling like LangChain (in particular there already seems to be support for integration with KG type databses in https://js.langchain.com/docs/use_cases/graph/semantic)


How do we let an agent establish whether they are 

