## NeOn

In this document we are following the following document to set out functional requirements etc. based on http://www.macs.hw.ac.uk/~yjc32/project/ref-ontology/ref-ontology%20building/1-2008-Gomez%20Perez-NeOn-Methodology-OntologySpecification-v3.pdf

## Specification

Ontology Specification refers to the activity of collecting the requirements that the ontology should fulfill, e.g. reasons to build the ontology, target group, intended uses,possibly reached through a consensus process.

## Goal

The specification activity states why the ontology is being built, what its intended uses are, who the end-users are, and what the requirements the ontology should fulfill are.

---

# Ontology Specification Requirements document

1. Purpose

This ontology is designed for *internal use* by software (AI) agents acting on behalf of [Person](https://schema.org/Person)s or [Organization](https://schema.org/Organization)s entities, to model the *risk assessment* that these entities make when choosing to "believe" a piece of information. This should be a best effort representation of the risk assessment that the entity would make given the same inputs as the software agent *unless* the entity explicitly guides the system otherwise. In cases where the system does not have sufficient information to make this decision, it should be able to gather user feedback.

*Belief in this context means that the system will use the data in a context where it may considered to be true by humans or other systems.

2. Scope

In scope:


Out of scope
 - Modelling the *correctness* of external systems/evalutions (e.g. from LLM inference). This is instead needs to be modelled in the data that is sent to a system.
 - Modelling the 

3. Level of Formality

The ontology has to be implemented in RDF.

<!-- “Software developers and ontology practitioners should include in this slot the level of formality of
the ontology”

The degree of formality to be used to codify the ontology should be also identified. Thisdegree of formality ranges from informal natural language to a rigorous formal language. Users,
Page 6 of 6 NeOn Integrated Project EU-IST-027595
domain experts and the ontology development team carry out this task taking as input a set of
ontological needs for obtaining the purpose, scope and level of formality of the ontology, using
techniques as physical or virtual interviewers between them. -->

4. Intended Users
 - Developers of software agents.
 - Individuals wanting to manage how their software agents interact with the outside world.
 - Buisnesses wanting to manage how their agents interact with the outside world.

5. Intended Uses
 - Autonomous software agents:
  - Representing a student at Oxford
  - 

6. Groups of Competency Questions

“Software developers and ontology practitioners should include in this slot the groups of competency questions and their answers, including priorities for each group”

7. Pre-Glossary of Terms

Terms “Software developers and ontology practitioners should include in this slot the list of terms
included in the CQs and their frequencies”

Objects “Software developers and ontology practitioners should include in this slot a list of objects and
their frequencies”
