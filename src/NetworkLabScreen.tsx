import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { lessonContent } from "./courseData";
import {
  commandPrompt, createDevice, createLabDevices, deviceProfiles, executeCommand,
  type DeviceKind, type NetworkDevice
} from "./networkSimulator";
import { colors } from "./theme";

type LabTopic = { id: string; title: string; explanation: string; example: string };

const suggestedCommands: Record<DeviceKind, string[]> = {
  switch: ["show vlan brief", "show interfaces trunk", "show spanning-tree", "show etherchannel summary", "show ip interface brief"],
  router: ["show ip route", "show ip ospf neighbor", "show ip interface brief", "show running-config", "ping 172.16.0.1"],
  firewall: ["show access-lists", "show ip interface brief", "show running-config", "test tcp 10.10.10.10 203.0.113.10 443", "show ip route"]
};

const kindIcon: Record<DeviceKind, keyof typeof Ionicons.glyphMap> = {
  switch: "git-network-outline",
  router: "navigate-outline",
  firewall: "shield-checkmark-outline"
};

export function NetworkLabScreen({ topic }: { topic?: LabTopic }) {
  const [devices, setDevices] = useState(createLabDevices);
  const [selectedId, setSelectedId] = useState("access");
  const [draft, setDraft] = useState("");
  const [consoleLines, setConsoleLines] = useState<string[]>([
    "PacketPath multi-device sandbox ready.",
    "Try enable, configure terminal, then help. Commands update this local simulation only."
  ]);
  const selectedDevice = devices.find((device) => device.id === selectedId) ?? devices[0];
  const scenario = topic ? lessonContent[topic.id]?.lab : undefined;
  const interfaceCount = devices.reduce((total, device) => total + device.interfaces.length, 0);
  const suggested = useMemo(() => suggestedCommands[selectedDevice.kind], [selectedDevice.kind]);

  const run = (raw: string) => {
    const command = raw.trim();
    if (!command) return;
    const result = executeCommand(selectedDevice, command, devices);
    setDevices((current) => current.map((device) => device.id === selectedDevice.id ? result.device : device));
    setConsoleLines((current) => [...current, `${commandPrompt(selectedDevice)} ${command}`, ...(result.output ? result.output.split("\n") : [])].slice(-70));
    setDraft("");
  };

  const addProfile = (profileId: string) => {
    const profile = deviceProfiles.find((candidate) => candidate.id === profileId);
    if (!profile) return;
    const ordinal = devices.filter((device) => device.profileId === profile.id).length + 1;
    const newDevice = createDevice(profile, ordinal);
    setDevices((current) => [...current, newDevice]);
    setSelectedId(newDevice.id);
    setConsoleLines((current) => [...current, `Added ${newDevice.model} as ${newDevice.hostname}.`].slice(-70));
  };

  const resetLab = () => {
    setDevices(createLabDevices());
    setSelectedId("access");
    setDraft("");
    setConsoleLines(["Starter topology restored.", "All device configurations in this local lab session were reset."]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerIcon}><Ionicons name="terminal-outline" size={19} color="#FFFFFF" /></View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>BUILD · CONFIGURE · VERIFY</Text>
          <Text style={styles.title}>Network lab</Text>
          <Text style={styles.subtitle}>Practice device configuration in a local, stateful command sandbox.</Text>
        </View>
      </View>

      {topic && scenario && (
        <View style={styles.scenarioCard}>
          <View style={styles.scenarioLabel}><Ionicons name="flask-outline" size={15} color={colors.blue} /><Text style={styles.scenarioEyebrow}>LESSON CHALLENGE · {topic.title}</Text></View>
          <Text style={styles.scenarioText}>{scenario.scenario}</Text>
          {scenario.command && scenario.command.split("\n").map((line, index) => <Text key={`${topic.id}-scenario-command-${index}`} selectable style={styles.scenarioCommand}>{line}</Text>)}
          <Text style={styles.scenarioHint}>Apply the relevant lines one at a time, then verify with show commands. Device support varies; the sandbox accepts the documented subset below.</Text>
        </View>
      )}

      <View style={styles.topologyCard}>
        <View style={styles.sectionHeader}>
          <View><Text style={styles.sectionTitle}>Your topology</Text><Text style={styles.sectionSub}>{devices.length} devices · {interfaceCount} interfaces · simulated links</Text></View>
          <Pressable onPress={resetLab} accessibilityRole="button" accessibilityLabel="Reset simulated topology" style={styles.resetChip}>
            <Ionicons name="refresh" size={13} color={colors.blue} /><Text style={styles.resetText}>RESET</Text>
          </Pressable>
        </View>
        <View style={styles.topologyPath}>
          {["SW-ACCESS", "SW-CORE", "R-BRANCH", "FW-EDGE"].map((label, index) => (
            <React.Fragment key={label}>
              <Text style={styles.topologyNode}>{label}</Text>
              {index < 3 && <Ionicons name="arrow-forward" size={12} color="#91A4BF" />}
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.topologyHint}>Preloaded path: access → core → branch router → ASA firewall. Added device profiles are standalone sandbox nodes.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deviceRow}>
          {devices.map((device) => (
            <Pressable key={device.id} onPress={() => setSelectedId(device.id)} style={[styles.deviceCard, selectedId === device.id && styles.deviceSelected]}>
              <Ionicons name={kindIcon[device.kind]} size={19} color={selectedId === device.id ? colors.blue : "#7D899A"} />
              <Text numberOfLines={1} style={[styles.deviceName, selectedId === device.id && styles.deviceNameSelected]}>{device.hostname}</Text>
              <Text numberOfLines={1} style={styles.deviceModel}>{device.model}</Text>
              <Text style={styles.deviceKind}>{device.kind.toUpperCase()}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.addLabel}>ADD A DEVICE PROFILE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileRow}>
          {deviceProfiles.map((profile) => (
            <Pressable key={profile.id} onPress={() => addProfile(profile.id)} style={styles.profileChip}>
              <Ionicons name={kindIcon[profile.kind]} size={14} color={colors.blue} />
              <Text style={styles.profileText}>+ {profile.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.cliCard}>
        <View style={styles.cliHeader}>
          <View style={styles.cliTitleRow}>
            <View style={styles.liveDot} />
            <Text style={styles.cliTitle}>{selectedDevice.hostname} · {selectedDevice.cli}</Text>
          </View>
          <Pressable onPress={() => setConsoleLines(["Console cleared."])} accessibilityRole="button" accessibilityLabel="Clear console">
            <Text style={styles.clearText}>CLEAR</Text>
          </Pressable>
        </View>
        <ScrollView style={styles.console} contentContainerStyle={styles.consoleContent} keyboardShouldPersistTaps="handled">
          {consoleLines.map((line, index) => <Text key={`${index}-${line}`} selectable style={styles.consoleLine}>{line}</Text>)}
        </ScrollView>
        <View style={styles.commandRow}>
          <Text style={styles.promptMark}>{commandPrompt(selectedDevice)}</Text>
          <TextInput
            accessibilityLabel="Device command input"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => run(draft)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="send"
            placeholder="Enter a supported command..."
            placeholderTextColor="#95A3B8"
            style={styles.commandInput}
          />
          <Pressable onPress={() => run(draft)} disabled={!draft.trim()} style={[styles.runButton, !draft.trim() && styles.runDisabled]} accessibilityRole="button" accessibilityLabel="Run device command">
            <Ionicons name="arrow-up" size={17} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View style={styles.helpCard}>
        <Text style={styles.sectionTitle}>Try a command</Text>
        <View style={styles.commandChips}>
          {suggested.map((command) => (
            <Pressable key={command} onPress={() => setDraft(command)} style={styles.commandChip}>
              <Text style={styles.commandChipText}>{command}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setDraft("help")} style={styles.commandChip}><Text style={styles.commandChipText}>help</Text></Pressable>
        </View>
        <Text style={styles.limitNote}>Simulation, not a Cisco image or hardware emulator. IOS/IOS XE, NX-OS, ASA, and FTD profiles expose a documented teaching subset; unsupported commands return an explicit error. Protocol convergence, full firewall inspection, and production behavior are not emulated. No commands reach real devices.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 11, marginBottom: 18 },
  header: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: "#152840", borderRadius: 16, padding: 16 },
  headerIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#2D5EA8", alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 8, fontWeight: "800", color: "#A8C4FF", letterSpacing: 1.2 },
  title: { fontSize: 19, fontWeight: "800", color: "#FFFFFF", marginTop: 3 },
  subtitle: { fontSize: 9, lineHeight: 14, color: "#C7D2E1", marginTop: 3 },
  scenarioCard: { borderRadius: 14, backgroundColor: "#EEF5FF", padding: 13, borderWidth: 1, borderColor: "#D8E6FC" },
  scenarioLabel: { flexDirection: "row", alignItems: "center", gap: 6 },
  scenarioEyebrow: { color: colors.blue, fontSize: 8, fontWeight: "800", flex: 1 },
  scenarioText: { color: colors.ink, fontSize: 11, lineHeight: 17, fontWeight: "700", marginTop: 8 },
  scenarioCommand: { color: "#D8E5FF", backgroundColor: "#152840", overflow: "hidden", borderRadius: 8, padding: 10, fontSize: 9, lineHeight: 14, marginTop: 8 },
  scenarioHint: { color: "#64748B", fontSize: 8, lineHeight: 12, marginTop: 7 },
  topologyCard: { backgroundColor: "#FFFFFF", borderRadius: 15, padding: 13, borderWidth: 1, borderColor: colors.line },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resetChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 5, paddingHorizontal: 7, borderRadius: 8, backgroundColor: "#EFF5FF" },
  resetText: { color: colors.blue, fontSize: 7, fontWeight: "800" },
  topologyPath: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  topologyNode: { color: "#3D506B", backgroundColor: "#EFF4FB", overflow: "hidden", paddingHorizontal: 6, paddingVertical: 5, borderRadius: 6, fontSize: 7, fontWeight: "800" },
  topologyHint: { color: colors.muted, fontSize: 8, lineHeight: 12, marginBottom: 5 },
  sectionTitle: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  sectionSub: { color: colors.muted, fontSize: 8, marginTop: 3 },
  deviceRow: { gap: 8, paddingVertical: 10 },
  deviceCard: { width: 130, padding: 10, borderRadius: 11, backgroundColor: "#F8FAFD", borderWidth: 1, borderColor: "#E7ECF3" },
  deviceSelected: { backgroundColor: "#EFF5FF", borderColor: colors.blue },
  deviceName: { color: colors.ink, fontSize: 10, fontWeight: "800", marginTop: 6 },
  deviceNameSelected: { color: colors.blue },
  deviceModel: { color: colors.muted, fontSize: 8, marginTop: 3 },
  deviceKind: { color: "#8290A2", fontSize: 7, fontWeight: "800", marginTop: 6, letterSpacing: 0.8 },
  addLabel: { color: "#8995A5", fontSize: 7, fontWeight: "800", letterSpacing: 0.8, marginTop: 2 },
  profileRow: { gap: 7, paddingTop: 7 },
  profileChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F3F6FB", borderRadius: 20, paddingHorizontal: 9, paddingVertical: 7, borderWidth: 1, borderColor: "#E3EAF3" },
  profileText: { color: "#40516A", fontSize: 8, fontWeight: "700" },
  cliCard: { borderRadius: 15, overflow: "hidden", backgroundColor: "#101B2B", borderWidth: 1, borderColor: "#243651" },
  cliHeader: { minHeight: 40, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#18273B" },
  cliTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#4BC69A" },
  cliTitle: { color: "#D9E5F5", fontSize: 9, fontWeight: "700" },
  clearText: { color: "#A8C4FF", fontSize: 8, fontWeight: "800" },
  console: { maxHeight: 220, minHeight: 130 },
  consoleContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  consoleLine: { color: "#BBD0EB", fontSize: 9, lineHeight: 14, fontFamily: "monospace" },
  commandRow: { minHeight: 46, borderTopWidth: 1, borderTopColor: "#2A3B53", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 9, backgroundColor: "#142237" },
  promptMark: { color: "#73D8AC", fontSize: 8, fontWeight: "700", maxWidth: 106 },
  commandInput: { flex: 1, color: "#FFFFFF", fontFamily: "monospace", fontSize: 9, paddingVertical: 9 },
  runButton: { width: 29, height: 29, backgroundColor: colors.blue, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  runDisabled: { opacity: 0.5 },
  helpCard: { backgroundColor: "#FFFFFF", borderRadius: 15, padding: 13, borderWidth: 1, borderColor: colors.line },
  commandChips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 9 },
  commandChip: { backgroundColor: "#F1F5FA", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  commandChipText: { color: "#42536C", fontSize: 8, fontFamily: "monospace" },
  limitNote: { color: "#778598", fontSize: 8, lineHeight: 13, marginTop: 10 }
});
