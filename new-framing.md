The LLM community has taken interested in building multi-agent dialogue between LLMs, with a vast range of applications including [...]. These research communities have identified that one of the core challenges they face is building trustworthy and reliable web agents [...].

In our work we consider a broader class of software agents which we term semi-autonomous web agents. These are agents which take a best-effort approach to dialogue without a human-in-the-loop interaction, but not to the extent that it compromises “outcomes” for the user (i.e. compromised security compared to user assumptions, sub-optimal conclusion etc.) to a level that invalidates the time/effort saved by the user.

In our research we aim to develop near-term solutions for developing trustworthy and reliable semi-autonomous web agents to represent individual, or organisational entities. In particular, we hope to make a contribution in answering the question “How do we build a decentralised network of semi-autonomous agents which represent individuals and organisations on the Web?”. To this end, we take a software architecture approach to define the functional, and non-functional requirements of a range of semi-autonomous web agents and subsequently define the requirements of a web protocol by which these agents would communicate. Thus far, we have identified that the communication protocol should support logically sound, descriptions of (1) usage restrictions on exchanged data (2) data origins and provenance, and (3) transactional outcomes of dialogues.

Using the architectural designs for agents, which conform to a protocol satisfying the above requirements - we have methodically identified a range of research challenges which must be solved in order to implement components of the software architectures. The primary challenge that has been identified is "How do we build a conceptual model a users trust perception(s) for use by semi-autonomous agents"? Consequently, this is the primary research challenge we aim to address as part of our thesis.



To the extent possible, we perform a literature review on the state-of-the-art for each research challenge, and then outline possible research directions that can be taken to work towards solving these challenges.
Thus, for my thesis, the guiding problem statement is “How do we build a decentralised network of semi-autonomous agents which represent individuals and organisations on the Web?” whilst the problem statements for tractable pieces of research I perform throughout my Doctorate are prescribed by (a subset of) the research challenges identified in the architectural design phase. We attempt to focus on those research challenges which have received the least attention in literature to date.

As we are still gathering functional requirements for a range of use cases, and are faced with space limitations in this doctoral consortium paper, the set of agents that we analyse the functional requirements of shall not be large enough to be representative of all semi-autonomous agents we wish to support. In particular, we are lacking use-cases and requirements from industry. In turn, the architecture for the communication protocol that we propose will require significant refinement, and the set of research challenges that we propose shall be incomplete, and, for the time-being, based on a level of the authors’ intuition for the problem space.




We do this by leveraging existing Semantic Web technologies to provide a harness for conversational AI dialogues ensuring unambiguous, and logically sound, descriptions of (1) usage restrictions on exchanged data (2) data origins and provenance, and (3) transactional outcomes of dialogues.

In order to develop this harness, we first need to solve the research challenge "How do we build a conceptual model a users trust perception(s) for use by semi-autonomous agents". This is the first research challenge we aim to address as part of our thesis.





The LLM community has taken interested in building multi-agent dialogue between LLMs, with a vast range of applications including [...]. These research communities have identified that one of the core challenges they face is building trustworthy and reliable web agents [...].

In our work we consider a broader class of software agents which we term semi-autonomous web agents. These are agents which take a best-effort approach to dialogue without a human-in-the-loop interaction, but not to the extent that it compromises “outcomes” for the user (i.e. compromised security compared to user assumptions, sub-optimal conclusion etc.) to a level that invalidates the time/effort saved by the user.

In our research we aim to develop near-term solutions for developing trustworthy and reliable semi-autonomous web agents to represent individual, or organisational entities. We do this by leveraging existing Semantic Web technologies to provide a harness for conversational AI dialogues ensuring unambiguous, and logically sound, descriptions of (1) usage restrictions on exchanged data (2) data origins and provenance, and (3) transactional outcomes of dialogues.

In order to develop this harness, we first need to solve the research challenge "How do we build a conceptual model a users trust perception(s) for use by semi-autonomous agents". This is the first research challenge we aim to address as part of our thesis.






that captures how users percieve the trustworthiness of 


of a users' trust assumptions, such that they can"

<!-- users' trust model of other entities in the world -->


Note to the reviewer. Our conte



<!-- The LLM research community  -->










Jun Questions:
jun.zhao: The abstract can be shorter given you are running out space.
May 1, 2024 8:08 AM

jun.zhao: What the specific research challenges you are trying to address should have been made clearer. What is a semi-autonomous agent? Why is a decentralisation approach needed?

jun.zhao: I am also a bit concerned if this is the research methodology you are based on. Software architecting is not a research method, while what you presented here is not entirely a requirements engineering approach either, as no users are involved. I wonder whether we could be a bit more abstract for the sake of this submission?


We would need more context to position this work. Why LLM per se? How is this related to semi-autonomous agents?

I am also a bit concerned if this is the research methodology you are based on. Software architecting is not a research method, while what you presented here is not entirely a requirements engineering approach either, as no users are involved. I wonder whether we could be a bit more abstract for the sake of this submission?
 - Note that I *want* to get industry stakeholders on board for this.



In our work we consider a broader class of software agents which we term semi-autonomous agents. For our work, these are agents which take a best-effort approach to operate without a human-in-the-loop interaction, but not to the extent that it compromises “outcomes” for the user (i.e. compromised security compared to user assumptions, sub-optimal conclusion etc.) to a level that invalidates the time/effort saved by the user.


<!-- *Motivation*:  -->
 <!-- -  -->

Semi-autonomous: Best effort operation without human interaction, but not to the extent that it compromises “outcomes” for the user (i.e. compromised security compared to user assumptions, sub-optimal conclusion etc.) to a level that invalidates the time/effort saved by the user.


Outline:
 - "How do we build user-friendly, semi-autonomous web-agents that respect users' trust assumptions?"
 - Key challenges: Ontology design + negotiation engines
 - To follow the NeOn method for ontology design, and get proper functional requirements for negotiation engines


Concluding remarks: Given that the research challenge that we are working on of 





[8:22 AM] Jesse Wright
Building a semi-autonomous system vs. trying address specific challenges of a specific kind of system:
 - In our research langauges, these are 2 different sets of research challenges. Building a system is less of a research objective, more industry language.
 - Another way of framing this in research language is "I'm trying to explore particular issues related to this semi-autonomous"
[8:23 AM] Jesse Wright
 - Define "semi-autonomous" better
[8:28 AM] Jesse Wright
Vision is to build this functional system that supports these kinds of scenarios. While I'm trying to build this system
[8:31 AM] Jesse Wright
JUN: May frame the story slightly different:
 - How does this semi-autonomous system provide a wonderful system for our society (Jesse: This is )
 - The critical challenge is to enable trust-negotiation
 
Don't make the story to complicated at this stage given that it is 4-6 pages.
 
Tease out some findings from the experiment
[8:34 AM] Jesse Wright
Give one overarching question that we are trying to explore for this thesis. And trying to use the requirements based methodology for this.
 
What I want to know is this methodlogy the right one.
 
How do I position all these challenges / choose all these challenges. I would like to hear from the comittee to hear about related work, literature approaches.

---

As far as I can tell, the problems that Jun has with the paper broadly fall into the categories of *language* and *scope*.

---

Entity recognition and selection context [https://www.sciencedirect.com/science/article/pii/S2949719123000146]

<!-- In step 2a of section 4.2 -->
In the LLM-based semi-autonomous agent architectures that we have created, there is a need for the agent to perform entity recognition to identify the Web Identities of entities that users are desribing using natural language. For instance, when an Nigel asks his agent to please "Schedule a meeting with Jun" there is a need to identify that Jun is the entity with the identifier <http://example.org/jun>. In initial prototypes that we have developed we simply use Retrieval Augmented Generation (RAG) with the prompt and the set of WebId contents that a user has explitly defined trust relationships with.

For this research challenge we should create a benchmark to evaluate how well a range of agents architectures perform on a range of entity recognition tasks.

This is demonstrated in 2a of section 4.2.

Information Retrival Context


---

Similarly in step~\ref{negotiate} of section~\ref{sample_flow} there is mediation between the \textbf{EDI} and \textbf{IDI} instance data in order for a semi-autonomous agent to establish which incoming claims it can \textit{believe}. Considering again the example where Nigels agent receives a set of claims from Jun which it wants to use - this mediation engine is responsible for (1) checking to see if the internal trust model already supports trusting Jun as a source of information in the context of the given task (2) if not attempting to gather enough provenance/evidence from the agents that it is negotiating with to support believing the current claims given the current trust model (3) prompting the user to see if they are willing to add trust information to their instance of the \textbf{IDI} model that would support believing claims from Jun in the context of the current task.

. For instance, if 

---

We first contextualise our specific research challenges by outlining the sample flow and functional requirement of a semi-autonomous agent we wish to support.

<!-- To further contextualise our research challenges we now present -->



Numerous communities across academia and industry are demonstrating an increasing interest in developing semi-autonomous agents. In this paper we work towards building a decentralised network of semi-autonomous agents which represent individuals and organisations on the Web. To this end, we take a software architecture approach to define the functional, and non-functional requirements of a range of agents and subsequently define the requirements of a Web-protocol by which these agents would communicate. With these functional requirements in place, we propose architectural designs for the semi-autonomous agents as well as the communication protocol they are to use. From these architectural designs we methodically specify a range of research challenges which must be solved in order to implement components of the software architectures. To the extent possible, we perform a literature review on the state-of-the-art for each research challenge, and then outline possible research directions that can be taken to work towards solving these challenges.
Thus, for my thesis, the guiding problem statement is “How do we build a decentralised network of semi-autonomous agents which represent individuals and organisations on the Web?” whilst the problem statements for tractable pieces of research I perform throughout my Doctorate are prescribed by (a subset of) the research challenges identified in the architectural design phase. We attempt to focus on those research challenges which have received the least attention in literature to date.

As we are still gathering functional requirements for a range of use cases, and are faced with space limitations in this doctoral consortium paper, the set of agents that we analyse the functional requirements of shall not be large enough to be representative of all semi-autonomous agents we wish to support. In particular, we are lacking use-cases and requirements from industry. In turn, the architecture for the communication protocol that we propose will require significant refinement, and the set of research challenges that we propose shall be incomplete, and, for the time-being, based on a level of the authors’ intuition for the problem space.

