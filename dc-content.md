




Semi-autonomous agents at web scale: a software architecture approach
Problem Statement: Numerous communities across academia and industry are demonstrating an increasing interest in developing semi-autonomous agents. In this paper we work towards building a decentralised network of semi-autonomous agents which represent individuals and organisations on the Web. To this end, we take a software architecture approach to define the functional, and non-functional requirements of a range of agents and subsequently define the requirements of a Web-protocol by which these agents would communicate. With these functional requirements in place, we propose architectural designs for the semi-autonomous agents as well as the communication protocol they are to use. From these architectural designs we methodically specify a range of research challenges which must be solved in order to implement components of the software architectures. To the extent possible, we perform a literature review on the state-of-the-art for each research challenge, and then outline possible research directions that can be taken to work towards solving these challenges.
Thus, for my thesis, the guiding problem statement is “How do we build a decentralised network of semi-autonomous agents which represent individuals and organisations on the Web?” whilst the problem statements for tractable pieces of research I perform throughout my DPhil are prescribed by (a subset of) the research challenges identified in the architectural design phase. We attempt to focus on those research challenges which have received the least attention in literature to date.

As we are still gathering functional requirements for a range of use cases, and are faced with space limitations in this doctoral consortium paper, the set of agents that we analyse the functional requirements of shall not be large enough to be representative of all semi-autonomous agents we wish to support. In turn, the architecture for the communication protocol that we propose will require significant refinement, and the set of research challenges that we propose shall be incomplete, and, for the time-being, based on a level of the authors’ intuition for the problem space.
Importance of the problem: The range of use-cases for autonomous web-agents is infinite, some of which we shall enumerate in our requirements section. The author, along with many others [add citation here], posits that in order to support those use-cases where agents serendipitously and autonomously interoperate with one-another in large-scale networks a standardised protocol for inter-agent communication is required.
Related work: Communication protocols for multi-agent systems have decades of history in academia [TODO: Cite both semantic web and LLM use-cases here]. However, most of this research does not take a product-led approach to their design, resulting in a limited amount of this work making its way into industry products. Moreover, the context in which we are developing multi-agent protocols has significantly shifted in the last few years. Due to advancements in LLM capabilities, multi-agent communication protocols may need to allow for more unstructured content than they have in the past. Changes in the regulatory context also need to be accounted for with systems now needing to ensure that the flow and analysis of data is compliant with the likes of GDPR and the AI safety act.
Hypothesis & Evaluation: Hypothesis’ and evaluations are more suited to the research challenges that are identified in the architectural design phase. The communication protocol shall also be evaluated based on how well the agents implementing that protocol are able to satisfy their functional requirements.
Agents:
A generic personal assistant for individuals
Sample flows (from the user perspective):
Scheduling a meeting (reactive). 2 individuals with a generic personal assistant:
The user (Nigel) types into a chat interface “Please schedule a dinner with Jun during ISWC”.
If any of Nigels personal data needs to be used in a way that he has not already permitted, the agent requests the relevant permissions which Nigel can approve, deny or modify.
If the agent cannot automatically determine whether data coming from Jun’s agent can be trusted, Nigel is prompted to answer questions about the trustworthiness/reliability of Jun’s agent as a source of information.
Depending on user preference Nigel is prompted to confirm a proposed meeting time before it is added to his calendar.
Notes:
Note that for better UX the agent SHOULD time any follow up questions at a time convenient for the user - e.g. asking them a batch of questions whilst they are at the gym.
Whilst only personal agents exist, we still require a human to go to the website page and make a booking unless one of these personal assistants has an out-of-band mechanism for interacting with the restaurant (e.g. through google APIs), and can thus make the booking that way.
Once this is in-band and we have agents for restaurants, the booking will have been made as part of the flow, ensuring that:
It is at a restaurant which has coeliac friendly & lactose free, because Nigel has coeliac disease and Jun is lactose intolerant.
If the booking requires payment, users may be prompted before booking is confirmed depending on their preferences.
Once this is in-band and we have agents for transport, any relevant transport will be arranged as part of the flow - even if this is just organising train tickets and pulling up the right google maps location when it is time to go.
Scheduling a meeting (proactive):
The user (Nigel) is talking to their agents (via voice) whilst they are at the gym organising their administrative tasks. The agent mentions that “Jun will also be attending ISWC, would you like for a dinner to be scheduled between the two of you”.
The user responds “yes”, and the flow continues in the same manner as defined from step (2)- in the reactive approach.
Booking a flight:


Functional requirements:
Users MUST be able to interact with this personal assistant via text and voice chat interfaces.
The personal assistant MUST respect user specified data sharing restrictions
The personal assistant MUST 
Specialised personal agents
Representing a student at Oxford
Organisation agents
Airline agent
Bank agent
Microsoft 365 copilot interacting with the outside world




A preliminary architecture for the generic personal agent:


A preliminary architecture for a communication protocol between these agents:

Research Challenges:
Entity recognition & selection (https://www.sciencedirect.com/science/article/pii/S2949719123000146):
How do we identify the entities that users are directly or indirectly referring to in their messages, and how do we select which ones need to be involved in given negotiations.
Extensions: Over time we will probably want to extend this to attribute & role based recognition. E.g. I don’t want to specifically open up a line of connection with British Airways, I want to open up a line of connection with all airlines that fly out of London.
Relevant data selection / information retrieval:
How do we identify the subset of data relevant to queries (so that we can establish what usage control policies need to be applied within a negotiation).
Trust (integrity) negotiations [when designing the ontologies for these negotiations, we note that the broader set of use-case & requirements that we have gathered can be used to inform the design of the ontologies for trust and provenance].
Usage requirement negotiations
Modelling correctness of data sent


Where applicable, we should not where these challenges align with the Guidelines and Principles for Trustworthiness Assessment of LLMs 

More for a blog article: If we are going to create a communication protocol for Web agents, we need to do so now and in collaboration with industry in order to build a robust approach that is not swayed by tech-debt in legacy systems, and is instead something that evolving systems can adapt with.

Why ISWC: The semantic web community has a long history of building Semantic Web services and agents. Consequently the initial architectures that the author proposes heavily makes use of these existing approaches.

Have you produced any results so far?
Based off the initial phase of requirements gathering and architectural design, we have implemented a prototype of the generic personal agent.

Ontology engineering: One of the key challenges that has been identified is building an agents internal trust model such that it is able to autonomously safely interact with the outside world. To develop an ontology model for this we are following the NEON approach.

Analogies:Surfaces Use Cases / Sample flows
When defining personal agents we should not go down the rabbit hole of making things like MPC and dialogues functional requirements from the get go - in fact we may want to explicitly make these non requirements and only set them as requirements when we have use cases that (1) require FOL guarantees or (2) require a level of privacy / security that necessitates MPC.

TODO: Find some FIPA people to talk to 
https://dl.acm.org/doi/pdf/10.1145/1293731.1293735:
Takeaways: They are also not trying to standardise internal algorithms
“The purpose of this paper is to present a critical analysis of the FIPA (Foundation for Intelligent Physical Agents) standard specifications for MAS interoperability.”
“The agent platform itself may not be modeled in terms of agents because mature, public service specifications already exist for some types of service, for example, service discovery, data storage, message transport, etc.”
A message context is needed in order to guide the semantics so that congruence about the semantics can be achieved between the sender and receiver and to enable an agent to orient the semantics to a specific application or circumstance.
Hence
the senders and receivers for Semantic MAS interaction tend to be stateful.
Semantic MAS interaction can be specified along the following dimensions:
1. Internal agent behavior: action selection and execution;
2. External (agent) interaction to exchange the:
a. Content of the interaction including both information and tasks;
b. Context of the Interaction and its relation to an agent organization;
3. System, or platform, services: message transport, discovery, action execu-
tion, management and interplatform interaction.
Other types of content expression have also been specified, such as W3C-RDF and a constraint language but these did not mature into standard specifications.
Agents are presumed to act sincerely in interactions, to always speak the truth and believe each other
Currently, the majority of business interaction standards are still very much syntactic rather than semantic.
Note there is still a lack of consensus within the Semantic Web how to model and combine rule type reasoning within the Semantic Web model, over 5 years since it was first proposed [Horrocks et al. 2005].
The motivation to evolve from Web services is that by using semantic annotations to describe services and resources, the tasks of service discovery, selection, negotiation, and binding could be automated



the set of research challenges that we outline shall be incomplete - and the c

we shall outline only the functional requirements for limited-capability agents acting on behalf of individuasl, and the protocol that they need to communicate. Consequently the challenges we define for these agents forms only a subset of the 

Definitions:
Semi-autonomous: Best effort operation without human interaction, but not to the extent that it compromises “outcomes” for the user (i.e. compromised security compared to user assumptions, sub-optimal conclusion etc.) to a level that invalidates the time/effort saved by the user.
Entity: Individual or organisation
What types of agents do we want to support?
Semi-autonomous agents that represent entities (see existing definition) on the Web.
Classifying of such agents
Generic personal agents
Specialised personal agents
Organisation agents
Airline agent
Bank agent


Functional requirements for 
https://www.altexsoft.com/blog/functional-and-non-functional-requirements-specification-and-types/

Nonfunctional Requirements
Nonfunctional requirements, which help ensure that a product will work the way users and other stakeholders expect it to, can be just as important as functional ones.
These may include:
Performance requirements
Safety requirements
Security requirements
Usability requirements
Scalability requirements

Overall story:
If we want AI agents to autonomously operate at web scale here is a general overview of the functional requirements they need
Given these functional requirements, here is a sketch of a protocol that these agents can use to negotiate whilst meeting those functional requirements
Here are the functional requirements of the protocol
Here are different types of agents, and respectively their functional requirements, and in turn, broadly speaking what range of features the protocol must support [this is where will say, starting *now* we need to get industry partners to properly define these functional requirements]. The requirements of the agents need to be used to inform the requirements of the protocol.
Here is where the semantic web community fills the gaps, here is where the LLM community fills the gaps, here are the challenges to still be solved.
We focus on the challenges of … and here is our path towards solving them.

1.	Problem statement: what is the problem that you are trying to solve?
What protocols and design patterns do we need to support Trustworthy and Reliable Autonomous Web Agents?
Under this theme we shall explore the following research questions:
How do we model interpersonal and institutional trust* in a way that enables personal agents to act autonomously on the behalf of an entity.
With trust broken down into ways that we shall discuss later (i.e. how do we model the 4-6 ontologies that we need to make this all work).
How do we coordinate the UX of user-in-the-loop (or even in some cases AI involvement) establishment of trust, whilst simultaneously doing the backchannel communication associated with proof?
How do we go between system 1 & system 2 actions?


I know it's somewhat late in the mix but I think I have another track of research I'd want to propose for interns if we get people that are more interested in UI which is to build interfaces for the 4 ontologies that we were taking about on Wednesday @Rui - in particular for trust being things like "do you trust the government for endorsement" and what signals can we show to the user to help them establish of it is the agency / person they think it is.
The 4 ontologies that need to be developed can be roughly described as follows:


Data Integrity
Data Usage
Data correctness
Functionality
Task criticality
Risk (Internal Modelling)
Which parties am I willing to believe and for what purposes.

What quality of proof do I need for given tasks.

(Trust in) integrity modelling.docx
What contracts are sufficient to share data for given purposes (partly relates to soft and hard rules)
?
Not really risk - but how does an agent know which other agents to approach for which tasks
Describing the agent's risk tolerance for a given task. I.e. how do we make the risk assessment … 
Reality (Exchanged Between Systems)
Proof + Provenance
Integrity modelling.docx
ODRL-ish
AI system declaring its “correctness” / accuracy on given tasks
? Service description ?



On the usage control side, how do we display and help users build custom usage control policies (and there you can think of 2 streams, one for an operator in a company, on for an end user)
Based on these initial architectures we have identified 4 conceptual models that need to be developed in order to 
2. 	Importance: Why is this problem important and for whom? Who will benefit and who should care? What is the impact of solving this problem (for the research community, or society in general)?
Importance for individuals and society:
AI assistants and agents are becoming more prominent
Critical for them to handle private data appropriately, make unambiguous and binding agreements, and provide transparent provenance of information
Solving this problem allows people to confidently leverage AI agents, knowing their data and interests are protected
Enables an ecosystem of reliable agentic services
Importance for businesses and organizations:
Companies want to deploy AI agents to assist customers and streamline operations
Need assurances around data handling, legally-enforceable agreements, and veracity of information to mitigate risks
A protocol for trustworthy agent dialogues provides accountability and auditability required for real-world commercial applications
Could facilitate new classes of AI-powered products and services
Importance for AI and web researchers:
Intersection of large language models, agent architectures, knowledge representation, and web protocols offers rich new problem spaces
Enabling safe and reliable agent-to-agent communication that leverages expressiveness of natural language while maintaining precision of structured data representations is an important challenge
Solutions could unlock more powerful human-AI collaboration
Importance for policymakers and society:
As AI systems become more autonomous and influential, governance frameworks are needed to protect public interest
Protocols that make AI behaviors more transparent, accountable, and steerable help uphold important values like privacy, fairness, and safety
Demonstrating solutions in this space can inform evidence-based policymaking around societal impacts of AI
Summary:
Trustworthy agentic dialogues are key to realizing the potential of AI assistants in a responsible manner that preserves human agency and oversight
It's a challenge at the intersection of technology and governance with wide-ranging impacts
Researchers, technologists, businesses, policymakers, and citizens all have a stake in advancing solutions to enable beneficial and reliable human-AI interaction
DPV fills an unique and necessary niche within the state of the art by providing concepts to represent legally relevant information to represent processing of personal data and use of technologies

3. 	Related work: Has a solution to this problem been attempted before and how? If not, have research efforts addressed similar problems? What can you learn from these efforts? If you are addressing an existing problem, what are the limitations of current solutions? What are you adding that is novel? Why?
Trust Modelling: 
Agents and Dialogues (Semantic Web)
Agents and Dialogues (LLM)
4.	Research question(s) and hypotheses: What hypotheses do you make in formulating your solution? What are the questions you need to answer in order to solve the problem? Are there boundary cases you plan to exclude or assumptions your work is based on?
What are the questions you need to answer in order to solve the problem?
How do we model trust assumptions (integrity) in personal agents
How do we model trust assumptions (usage control) in personal agents
How do we model data integrity at a general level.
Are there boundary cases you plan to exclude or assumptions your work is based on?
Broadly speaking assume that the usage control policies (Beatriz’s work) are in place - though will be collaborating on how to make these work as a dialogue.
Assumptions:
Hard coding the “transaction” of a dialogue is feasible


5.	Research methods: What methods did you follow in your proposal? Have you produced any results so far?
Ontology Engineering:
https://oeg.fi.upm.es/index.php/en/methodologies/59-neon-methodology/index.html
http://www.macs.hw.ac.uk/~yjc32/project/ref-ontology/ref-ontology%20building/1-2008-Gomez%20Perez-NeOn-Methodology-OntologySpecification-v3.pdf
https://docs.google.com/document/d/168eyCAGCV9R-w0-Wm_k8V-xTntEnNP5fpMIPFZaX3g8/edit


DPV follows best practices and guidelines established within the semantic
web community. Namely, the W3C Best Practices for Publishing Linked Data, WIDOCO best practices [35], W3ID for permanent IRIs, GitHub for version control and collaboration, and Zenodo for archival.
6. 	Evaluation: How do you know when you have answered your question(s)? What are the methods you apply to test your hypotheses? Have you identified criteria to measure the degree of success of your solution?
Evaluating ontologies
Look up ways evaluating ontologies against a set of functional requirements
Evaluating trust UI / human-in-the-loopness
User studies on how well what users are selecting for trust aligns with what they want to actually do
RQ: How do we build, collaboratively with users, their trust assumptions of the world.

Evaluating agent selection of relevant views:
Should the LLM always be
Evaluating agents calling trust UIs


7. 	Limitations and future work: Are there any limitations in your approach? What are your planned next steps to complete your investigation?
8. What support do I need?
Guidance from ontology modelling experts; I need to stop thinking that I am one
Working with other people involved with AI governance and/or getting involved with industry use-cases


Please aim to answer the above questions with as much detail as possible, especially questions 2 and 4. You should provide as much detail as possible to allow a knowledgeable reviewer from the Semantic Web community, but possibly not an expert in your topic, to assess the validity of your research contribution.
All submissions should include references, which are not counted towards the max page limit. All papers exceeding 6 pages plus references will be desk rejected and therefore will not be reviewed.
Submissions should be authored by the student only. The supervisor(s) should be acknowledged at the end of the paper, together with a funding agency or any other party who supports or contributes to the research.
Submissions must use the CEUR-ART style. For details on the CEUR-ART style, see Publishing at CEUR-WS.org. They must be submitted online via EasyChair, in PDF format.
Authors of accepted papers must register to the conference and present their work at the Doctoral Consortium. Students are expected to attend the DC for the whole day in order to gain as much value as possible from the experience.
Authors must be enrolled in a doctoral programme and must not have submitted their dissertation at the time of submission to the Doctoral Consortium.
DC Proceedings will be published with CEUR-WS.org.

Other target submissions:
https://neurosymbolic-ai-journal.com/content/call-papers-special-issue-trustworthy-neurosymbolic-ai [July 30 2024]
Reading list:
https://www.linkedin.com/pulse/when-trust-enough-marcos-carrera-lbcff/ [DONE]

TODO:
Reimbursement

Software artefacts:
Trust negotiation engine
Terms of use negotiation engine
Web 3(.0)? proof bus
See DPhil proposal
See https://people.cs.georgetown.edu/jthaler/ProofsArgsAndZK.pdf
See https://github.com/ventali/awesome-zk?tab=readme-ov-file#tools, in particular https://github.com/iden3/snarkjs
UI Elements / patterns for human-in-the-loop trust assessments


