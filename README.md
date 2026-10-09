# PacketPath CCNA Mobile

A React Native study companion for the CCNA 200-301 exam, built with Expo and TypeScript.

## Features

- A mobile-first dashboard and five-section navigation.
- A searchable 48-topic study path covering the six CCNA exam domains.
- An explanation, practical example, and topic-specific multiple-choice check for every listed lesson.
- A 12-question randomized practice exam with a 15-minute timer, weighted domain coverage, score history, and answer explanations.
- Interactive subnet/prefix calculator, switch-port VLAN simulator, and ACL permit/deny simulator.
- A searchable networking glossary and personal study notes saved locally on the device.
- On-device lesson completion, study streak, and best practice-exam score storage.
- An exam blueprint showing the six domain weights.

PacketPath is an independent educational project and is not an official Cisco product. Exam objectives can change; verify current requirements with Cisco before exam day.

## Run locally

1. Install Node.js LTS.
2. From this directory, run `npm install`.
3. Run `npm start` and open the project with Expo Go, or use `npm run android` / `npm run ios` with the relevant simulator tooling installed.
4. Run `npm run typecheck` to check the TypeScript project.

The starter project uses Expo SDK 54. Use a compatible Expo Go version or an Expo development build for your target device.

The practice exam is a learning aid and is not a replica of Cisco exam questions or a prediction of a passing score. The simulations are educational models and do not configure real network equipment.

## GitHub Actions

The `React Native CI` workflow runs on pushes to `main`, pull requests, and manual dispatch. It installs Node.js 22 dependencies, runs the TypeScript check, and validates the Expo public configuration.
