# PacketPath Networking Study Lab

A React Native networking study app for CCNA 200-301 and CCNP Enterprise (350-401 ENCOR and 300-410 ENARSI), built with Expo and TypeScript.

## Features

- A mobile-first dashboard and five-section navigation.
- A searchable 48-topic study path covering the six CCNA exam domains.
- A separate CCNP Enterprise path with 57 advanced topics across ENCOR and ENARSI, including campus architecture, advanced switching and routing, BGP, OSPF, EIGRP, IPv6, QoS, multicast, VPNs, infrastructure security, assurance, and automation.
- Detailed topic lessons with learning objectives, concept walkthroughs, original visual diagrams, worked examples, IOS command references where relevant, and guided lab tasks with step-by-step checks.
- Eight original question-bank items for every CCNA and CCNP topic, mixing single choice, multi-select, ordering, and read-the-output simlets. Each option includes a rationale; topic lessons link to the complete eight-question set.
- Quick and domain-focused practice sets (12 questions, 15 minutes) and full practice forms (100 CCNA or 80 ENCOR/ENARSI questions, 120 minutes), weighted by the selected blueprint domain.
- Exam flags, question palette, pause/resume with on-device session recovery, answer review with per-option explanations, weighted domain results, and links to lessons for missed topics. Question rotation avoids repeats until the applicable bank has been exhausted.
- A multi-device command sandbox with configurable Catalyst access/core switches, a Catalyst 2960, Nexus 9000, ISR/ASR routers, and ASA/Secure Firewall teaching profiles. Commands modify simulated device state; unsupported commands return explicit feedback.
- Interactive subnet/prefix calculator, switch-port VLAN simulator, and ACL permit/deny simulator.
- Direct links to Cisco's current CCNA, CCNP Enterprise, ENCOR, and ENARSI exam references.
- A searchable networking glossary and personal study notes saved locally on the device.
- An offline course tutor that finds explanations and examples in the built-in curriculum. It is not a generative AI service; questions stay on the device.
- On-device lesson completion, study streak, and best practice-exam score storage.
- Exam blueprints showing CCNA and the separate ENCOR/ENARSI domain weights. Question sets are version-tagged against CCNA 200-301 v1.1, ENCOR 350-401 v1.1, and ENARSI 300-410 v1.1; see [the question-bank changelog](./QUESTION_BANK_CHANGELOG.md).

PacketPath is an independent educational project and is not an official Cisco product. Lesson wording, examples, quizzes, and labs are original study material, not copied Cisco course content. Cisco's official pages are linked as references; exam objectives can change, so verify the current blueprint before exam day.

## Run locally

1. Install Node.js LTS.
2. From this directory, run `npm install`.
3. Run `npm run web` to open the app in a desktop browser, or run `npm start` to open it with Expo Go. Use `npm run android` / `npm run ios` with the relevant simulator tooling installed.
4. Run `npm run typecheck` to check the TypeScript project and `npm test` to validate the assessment engine and question-bank coverage.

The starter project uses Expo SDK 54. Use a compatible Expo Go version or an Expo development build for your target device.

The practice exams are learning aids, not replicas of Cisco exam questions or predictions of a passing score. Question counts and duration are PacketPath practice settings and do not state the official number of questions on a Cisco exam. The device lab is a local command/state teaching simulator—not Cisco IOS, IOS XE, NX-OS, ASA, or FTD software, a full protocol emulator, or a production network. Its supported command subset is intentionally limited and will not configure or connect to real equipment. Validate real-device syntax and behavior against the platform and release documentation.

## GitHub Actions

The `React Native CI` workflow runs on pushes to `main`, pull requests, and manual dispatch. It installs Node.js 22 dependencies, runs the TypeScript check, validates the Expo public configuration, and exports the web app.

## Cisco official references

- [CCNA 200-301 exam](https://www.cisco.com/site/us/en/learn/training-certifications/exams/ccna.html)
- [CCNP Enterprise certification](https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccnp-enterprise/index.html)
- [350-401 ENCOR exam](https://www.cisco.com/site/us/en/learn/training-certifications/exams/encor.html)
- [300-410 ENARSI exam](https://www.cisco.com/site/us/en/learn/training-certifications/exams/enarsi.html)
