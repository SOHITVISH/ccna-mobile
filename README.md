# PacketPath Networking Study Lab

A React Native networking study app for CCNA 200-301 and CCNP Enterprise (350-401 ENCOR and 300-410 ENARSI), built with Expo and TypeScript.

## Features

- A mobile-first dashboard and five-section navigation.
- A searchable 48-topic study path covering the six CCNA exam domains.
- A separate CCNP Enterprise path with 57 advanced topics across ENCOR and ENARSI, including campus architecture, advanced switching and routing, BGP, OSPF, EIGRP, IPv6, QoS, multicast, VPNs, infrastructure security, assurance, and automation.
- Detailed topic lessons with learning objectives, concept walkthroughs, original visual diagrams, worked examples, IOS command references where relevant, and guided lab tasks with step-by-step checks.
- A topic-matched quick-check quiz and guided lab check for every CCNA and CCNP lesson, with lesson-specific configuration examples.
- A randomized 12-question practice exam with a 15-minute timer and exam-weighted domain coverage for the selected track.
- A multi-device command sandbox with configurable Catalyst access/core switches, a Catalyst 2960, Nexus 9000, ISR/ASR routers, and ASA/Secure Firewall teaching profiles. Commands modify simulated device state; unsupported commands return explicit feedback.
- Interactive subnet/prefix calculator, switch-port VLAN simulator, and ACL permit/deny simulator.
- Direct links to Cisco's current CCNA, CCNP Enterprise, ENCOR, and ENARSI exam references.
- A searchable networking glossary and personal study notes saved locally on the device.
- An offline course tutor that finds explanations and examples in the built-in curriculum. It is not a generative AI service; questions stay on the device.
- On-device lesson completion, study streak, and best practice-exam score storage.
- Exam blueprints showing CCNA and the separate ENCOR/ENARSI domain weights.

PacketPath is an independent educational project and is not an official Cisco product. Lesson wording, examples, quizzes, and labs are original study material, not copied Cisco course content. Cisco's official pages are linked as references; exam objectives can change, so verify the current blueprint before exam day.

## Run locally

1. Install Node.js LTS.
2. From this directory, run `npm install`.
3. Run `npm run web` to open the app in a desktop browser, or run `npm start` to open it with Expo Go. Use `npm run android` / `npm run ios` with the relevant simulator tooling installed.
4. Run `npm run typecheck` to check the TypeScript project.

The starter project uses Expo SDK 54. Use a compatible Expo Go version or an Expo development build for your target device.

The practice exams are learning aids, not replicas of Cisco exam questions or predictions of a passing score. The device lab is a local command/state teaching simulator—not Cisco IOS, IOS XE, NX-OS, ASA, or FTD software, a full protocol emulator, or a production network. Its supported command subset is intentionally limited and will not configure or connect to real equipment. Validate real-device syntax and behavior against the platform and release documentation.

## GitHub Actions

The `React Native CI` workflow runs on pushes to `main`, pull requests, and manual dispatch. It installs Node.js 22 dependencies, runs the TypeScript check, validates the Expo public configuration, and exports the web app.

## Cisco official references

- [CCNA 200-301 exam](https://www.cisco.com/site/us/en/learn/training-certifications/exams/ccna.html)
- [CCNP Enterprise certification](https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccnp-enterprise/index.html)
- [350-401 ENCOR exam](https://www.cisco.com/site/us/en/learn/training-certifications/exams/encor.html)
- [300-410 ENARSI exam](https://www.cisco.com/site/us/en/learn/training-certifications/exams/enarsi.html)
