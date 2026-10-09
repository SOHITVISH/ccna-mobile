# PacketPath question-bank and blueprint changelog

Question sets are original PacketPath study material, not Cisco exam questions. Blueprint labels identify the exam-topic version used to organize practice content; they do not imply official Cisco endorsement.

Question content is maintained as TypeScript data under `src/questionBank/`; do not place question wording in UI components. Content validation requires eight items per topic (four single-choice, two multi-select, one ordering, one output simlet), four separately explained choices/items for each question, unique question and option IDs, and answer keys that match their option IDs. `npm test` enforces topic coverage and structural validation.

## Initial bank

- Add eight questions for each of the 105 CCNA and CCNP course topics.
- Use PacketPath practice lengths of 12 questions for quick/domain sets, 100 for CCNA full practice, and 80 for ENCOR or ENARSI full practice. Full practice uses a 120-minute timer. These are app settings, not statements of official exam length.
- Align domain selection and weighting to the curriculum's current topic weights.
- Blueprint references: CCNA 200-301 v1.1, ENCOR 350-401 v1.1, ENARSI 300-410 v1.1.
- Cisco's current exam pages list CCNA and ENCOR at 120 minutes and ENARSI at 90 minutes; PacketPath intentionally keeps the approved 120-minute study timer for all full practice forms.
- Blueprint references: [CCNA](https://www.cisco.com/site/us/en/learn/training-certifications/exams/ccna.html), [ENCOR](https://www.cisco.com/site/us/en/learn/training-certifications/exams/encor.html), and [ENARSI](https://www.cisco.com/site/us/en/learn/training-certifications/exams/enarsi.html).
