import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { allTopics, curriculum, topicById, type Domain, type Topic } from "./src/curriculum";
import { glossary } from "./src/glossary";
import { quizBank, type QuizQuestion } from "./src/quizBank";
import { colors } from "./src/theme";

type Tab = "Learn" | "Path" | "Labs" | "Resources" | "Profile";
type StudyNote = { id: string; text: string; createdAt: string };
type Progress = { completed: string[]; streak: number; lastStudyDate?: string; bestExamScore: number | null };
const STORAGE_KEY = "packetpath.progress.v1";
const NOTES_STORAGE_KEY = "packetpath.notes.v1";
const initialProgress: Progress = { completed: [], streak: 0, bestExamScore: null };

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [tab, setTab] = useState<Tab>("Learn");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [examActive, setExamActive] = useState(false);
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [notesHydrated, setNotesHydrated] = useState(false);
  const [prefix, setPrefix] = useState("26");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const totalTopicCount = curriculum.reduce((total, domain) => total + domain.topics.length, 0);
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved && mounted) {
          const parsed: unknown = JSON.parse(saved);
          if (
            typeof parsed === "object" &&
            parsed !== null &&
            "completed" in parsed &&
            Array.isArray(parsed.completed)
          ) {
            setProgress({
              completed: parsed.completed.filter((item): item is string => typeof item === "string" && allTopics.some((topic) => topic.id === item)),
              streak: "streak" in parsed && typeof parsed.streak === "number" ? Math.max(0, Math.floor(parsed.streak)) : 0,
              lastStudyDate: "lastStudyDate" in parsed && typeof parsed.lastStudyDate === "string" ? parsed.lastStudyDate : undefined,
              bestExamScore: "bestExamScore" in parsed && typeof parsed.bestExamScore === "number" ? Math.max(0, Math.min(100, Math.floor(parsed.bestExamScore))) : null,
            });
          }
        }
      })
      .catch((error: unknown) => console.error("Unable to load saved study progress.", error))
      .finally(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(NOTES_STORAGE_KEY)
      .then((saved) => {
        if (!saved || !mounted) return;
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotes(parsed.filter((item): item is StudyNote =>
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            typeof item.id === "string" &&
            "text" in item &&
            typeof item.text === "string" &&
            "createdAt" in item &&
            typeof item.createdAt === "string"
          ));
        }
      })
      .catch((error: unknown) => console.error("Unable to load saved study notes.", error))
      .finally(() => {
        if (mounted) setNotesHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)).catch((error: unknown) =>
      console.error("Unable to save study progress.", error)
    );
  }, [hydrated, progress]);

  useEffect(() => {
    if (!notesHydrated) return;
    AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes)).catch((error: unknown) =>
      console.error("Unable to save study notes.", error)
    );
  }, [notesHydrated, notes]);

  const activeTopic = activeTopicId ? topicById(activeTopicId) : undefined;
  const completedCount = progress.completed.length;
  const currentDomain = curriculum.find((domain) => domain.id === activeDomainId);
  const suggestedTopic = allTopics.find((topic) => !progress.completed.includes(topic.id)) ?? allTopics[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const todayKey = localDateKey(new Date());
  const currentStreak = progress.lastStudyDate === todayKey || progress.lastStudyDate === localDateKey(yesterdayDate)
    ? progress.streak
    : 0;

  const openTopic = (topic: Topic) => {
    setActiveTopicId(topic.id);
    setSelectedAnswer(null);
  };

  const completeTopic = (topicId: string) => {
    setProgress((current) => {
      if (current.completed.includes(topicId)) return current;
      const today = localDateKey(new Date());
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = localDateKey(yesterdayDate);
      const streak = current.lastStudyDate === today
        ? current.streak
        : current.lastStudyDate === yesterday
          ? current.streak + 1
          : 1;
      return { ...current, completed: [...current.completed, topicId], streak, lastStudyDate: today };
    });
  };

  const handleExamResult = useCallback((score: number) => {
    setProgress((current) => ({
      ...current,
      bestExamScore: current.bestExamScore === null ? score : Math.max(current.bestExamScore, score),
    }));
  }, []);

  const backToTab = () => {
    setActiveTopicId(null);
    setActiveDomainId(null);
    setSelectedAnswer(null);
  };

  const hostCount = useMemo(() => {
    const parsedPrefix = Number.parseInt(prefix, 10);
    if (!Number.isInteger(parsedPrefix) || parsedPrefix < 0 || parsedPrefix > 32) return null;
    if (parsedPrefix === 32) return 1;
    if (parsedPrefix === 31) return 2;
    return 2 ** (32 - parsedPrefix) - 2;
  }, [prefix]);

  if (!hydrated || !notesHydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingScreen}>
          <View style={styles.brandMark}><Ionicons name="git-network" size={17} color="#FFFFFF" /></View>
          <Text style={styles.loadingTitle}>Getting your study space ready</Text>
          <Text style={styles.loadingCopy}>Loading lessons, progress, and notes saved on this device.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (activeTopic) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <LessonScreen
          topic={activeTopic}
          completed={progress.completed.includes(activeTopic.id)}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={setSelectedAnswer}
          onBack={backToTab}
          onComplete={() => {
            completeTopic(activeTopic.id);
            backToTab();
          }}
        />
      </SafeAreaView>
    );
  }

  if (examActive) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <PracticeExam
          onExit={() => setExamActive(false)}
          onResult={handleExamResult}
          bestScore={progress.bestExamScore}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {tab === "Learn" && (
            <LearnScreen
              completedCount={completedCount}
              totalTopicCount={totalTopicCount}
              streak={currentStreak}
              suggestedTopic={suggestedTopic}
              onContinue={() => {
                if (suggestedTopic) openTopic(suggestedTopic);
              }}
              onPracticeExam={() => setExamActive(true)}
              onDomain={(domain) => {
                setActiveDomainId(domain.id);
                setTab("Path");
              }}
              onTab={setTab}
            />
          )}
          {tab === "Path" && (
            <PathScreen
              domains={curriculum}
              completed={progress.completed}
              totalTopicCount={totalTopicCount}
              selectedDomain={currentDomain}
              search={search}
              onSearch={setSearch}
              onDomain={(domain) => setActiveDomainId(domain.id)}
              onBack={() => setActiveDomainId(null)}
              onOpenTopic={openTopic}
            />
          )}
          {tab === "Labs" && (
            <LabsScreen
              prefix={prefix}
              hostCount={hostCount}
              onPrefix={setPrefix}
              completed={progress.completed.includes("ipv4-subnetting")}
              onOpen={() => {
                const topic = topicById("ipv4-subnetting");
                if (topic) openTopic(topic);
              }}
            />
          )}
          {tab === "Resources" && (
            <ResourcesScreen
              notes={notes}
              onAddNote={(text) => setNotes((current) => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text, createdAt: new Date().toISOString() }, ...current])}
              onDeleteNote={(id) => setNotes((current) => current.filter((note) => note.id !== id))}
            />
          )}
          {tab === "Profile" && (
            <ProfileScreen
              completedCount={completedCount}
              streak={currentStreak}
              bestExamScore={progress.bestExamScore}
              onReset={() => Alert.alert(
                "Reset learning progress?",
                "This removes completed lessons, study streak, and exam score from this device.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Reset progress", style: "destructive", onPress: () => setProgress(initialProgress) },
                ]
              )}
            />
          )}
        </ScrollView>
        <TabBar current={tab} onChange={(next) => {
          setActiveDomainId(null);
          setSearch("");
          setTab(next);
        }} />
      </View>
    </SafeAreaView>
  );
}

function Header({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}><Ionicons name="git-network" size={17} color="#FFFFFF" /></View>
        <Text style={styles.brand}>PacketPath</Text>
        <View style={styles.streakBadge}><Text style={styles.streakFlame}>✦</Text><Text style={styles.streakText}>CCNA</Text></View>
      </View>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function LearnScreen({
  completedCount, totalTopicCount, streak, suggestedTopic, onContinue, onPracticeExam, onDomain, onTab,
}: {
  completedCount: number; totalTopicCount: number; streak: number; onContinue: () => void;
  suggestedTopic: (typeof allTopics)[number];
  onPracticeExam: () => void;
  onDomain: (domain: Domain) => void; onTab: (tab: Tab) => void;
}) {
  const suggestedDomain = curriculum.find((domain) => domain.id === suggestedTopic.domainId);
  const suggestedLessonNumber = (suggestedDomain?.topics.findIndex((topic) => topic.id === suggestedTopic.id) ?? 0) + 1;
  return (
    <View>
      <Header eyebrow="Your learning space" title="Build your network IQ." subtitle="Small steps. Strong foundations. CCNA ready." />
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardBlue]}>
          <Text style={styles.statLabel}>STUDY STREAK</Text>
          <Text style={styles.statValue}>{streak} day <Text style={styles.statEmoji}>✦</Text></Text>
          <Text style={styles.statHint}>{streak > 0 ? "Keep your rhythm going" : "Complete a lesson to start"}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>LESSONS DONE</Text>
          <Text style={styles.statValue}>{completedCount}<Text style={styles.statSmall}> / {totalTopicCount}</Text></Text>
          <Text style={styles.statHint}>Across all domains</Text>
        </View>
      </View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Pick up where you left off</Text>
        <Text style={styles.smallMuted}>8 min</Text>
      </View>
      <Pressable style={styles.continueCard} onPress={onContinue}>
        <View style={styles.continueTop}>
          <View style={styles.continueIcon}><Ionicons name="git-branch-outline" size={19} color={colors.blue} /></View>
          <View style={styles.continueBadge}><Text style={styles.continueBadgeText}>UP NEXT</Text></View>
        </View>
        <Text style={styles.continueTitle}>{completedCount === totalTopicCount ? "Review a lesson" : suggestedTopic.title}</Text>
        <Text style={styles.continueCopy}>{suggestedTopic.explanation}</Text>
        <View style={styles.continueBottom}>
          <Text style={styles.continueMeta}>{suggestedTopic.domainTitle.toUpperCase()}  ·  LESSON {suggestedLessonNumber}</Text>
          <View style={styles.roundArrow}><Ionicons name="arrow-forward" size={16} color="#FFFFFF" /></View>
        </View>
      </Pressable>
      <Pressable style={styles.examLaunchCard} onPress={onPracticeExam}>
        <View style={styles.examLaunchIcon}><Ionicons name="timer-outline" size={19} color="#FFFFFF" /></View>
        <View style={styles.flexOne}>
          <Text style={styles.examLaunchTitle}>Take a practice exam</Text>
          <Text style={styles.examLaunchCopy}>12 questions · timed · exam-weighted</Text>
        </View>
        <Ionicons name="arrow-forward" size={17} color={colors.blue} />
      </Pressable>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Your learning path</Text>
        <Pressable onPress={() => onTab("Path")}><Text style={styles.linkText}>See all</Text></Pressable>
      </View>
      <Text style={styles.sectionIntro}>Six exam domains, one confident you.</Text>
      {curriculum.map((domain) => (
        <DomainCard key={domain.id} domain={domain} onPress={() => onDomain(domain)} />
      ))}
      <View style={styles.miniLabCard}>
        <View style={styles.miniLabIcon}><Ionicons name="flask-outline" size={20} color="#8B64DA" /></View>
        <View style={styles.flexOne}>
          <Text style={styles.miniLabTitle}>Ready to get hands-on?</Text>
          <Text style={styles.miniLabCopy}>Try the subnetting mini lab</Text>
        </View>
        <Pressable style={styles.textArrow} onPress={() => onTab("Labs")}><Ionicons name="arrow-forward" size={18} color="#8B64DA" /></Pressable>
      </View>
      <Pressable style={styles.resourceLaunchCard} onPress={() => onTab("Resources")}>
        <View style={styles.resourceLaunchIcon}><Ionicons name="book-outline" size={19} color="#287F68" /></View>
        <View style={styles.flexOne}>
          <Text style={styles.resourceLaunchTitle}>Glossary & study notes</Text>
          <Text style={styles.resourceLaunchCopy}>Look up terms or save your own notes</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color="#287F68" />
      </Pressable>
      <Text style={styles.footerNote}>Aligned to the CCNA 200-301 exam topics</Text>
    </View>
  );
}

function DomainCard({ domain, onPress }: { domain: Domain; onPress: () => void }) {
  return (
    <Pressable style={styles.domainCard} onPress={onPress}>
      <View style={[styles.domainIcon, { backgroundColor: `${domain.color}18` }]}>
        <Ionicons name={domain.icon} size={20} color={domain.color} />
      </View>
      <View style={styles.flexOne}>
        <Text style={styles.domainTitle}>{domain.title}</Text>
        <Text style={styles.domainMeta}>{domain.weight}% exam weight  ·  {domain.topics.length} topics</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color="#A4ADBA" />
    </Pressable>
  );
}

function PathScreen({
  domains, completed, totalTopicCount, selectedDomain, search, onSearch, onDomain, onBack, onOpenTopic,
}: {
  domains: Domain[]; completed: string[]; totalTopicCount: number; selectedDomain?: Domain; search: string;
  onSearch: (value: string) => void; onDomain: (domain: Domain) => void; onBack: () => void; onOpenTopic: (topic: Topic) => void;
}) {
  const topicsForDomain = (domain: Domain) => {
    const query = search.trim().toLowerCase();
    return domain.topics.filter((topic) =>
      !query ||
      topic.title.toLowerCase().includes(query) ||
      topic.explanation.toLowerCase().includes(query) ||
      topic.example.toLowerCase().includes(query)
    );
  };

  return (
    <View>
      <Header eyebrow="Study roadmap" title={selectedDomain?.title ?? "The full picture."} subtitle={selectedDomain ? `${selectedDomain.weight}% of the CCNA exam · ${selectedDomain.topics.length} topics` : "Everything you need, organized one topic at a time."} />
      {selectedDomain ? (
        <View>
          <Pressable style={styles.backLink} onPress={onBack}>
            <Ionicons name="arrow-back" size={16} color={colors.blue} /><Text style={styles.backLinkText}>All exam domains</Text>
          </Pressable>
          <View style={styles.domainSummary}>
            <View style={[styles.domainIconLarge, { backgroundColor: `${selectedDomain.color}18` }]}>
              <Ionicons name={selectedDomain.icon} size={24} color={selectedDomain.color} />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.domainSummaryTitle}>{selectedDomain.title}</Text>
              <Text style={styles.domainSummaryMeta}>{selectedDomain.weight}% exam weight</Text>
            </View>
          </View>
          {selectedDomain.topics.map((topic, index) => (
            <Pressable key={topic.id} style={styles.topicRow} onPress={() => onOpenTopic(topic)}>
              <View style={[styles.topicNumber, completed.includes(topic.id) && styles.topicNumberDone]}>
                {completed.includes(topic.id) ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : <Text style={styles.topicNumberText}>{String(index + 1).padStart(2, "0")}</Text>}
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription} numberOfLines={2}>{topic.explanation}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#A4ADBA" />
            </Pressable>
          ))}
        </View>
      ) : (
        <View>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput value={search} onChangeText={onSearch} placeholder="Search topics and concepts" placeholderTextColor="#9AA4B2" style={styles.searchInput} />
            {search.length > 0 && <Pressable onPress={() => onSearch("")}><Ionicons name="close-circle" size={17} color="#A4ADBA" /></Pressable>}
          </View>
          <View style={styles.overallProgress}>
            <View style={styles.progressTop}>
              <Text style={styles.overallLabel}>YOUR CURRICULUM</Text>
              <Text style={styles.overallCount}>{completed.length} lessons completed</Text>
            </View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, Math.round(completed.length / totalTopicCount * 100))}%` }]} /></View>
          </View>
          {domains.map((domain) => {
            const visibleTopics = topicsForDomain(domain);
            if (search && visibleTopics.length === 0) return null;
            return (
              <View key={domain.id} style={styles.pathDomain}>
                <Pressable style={styles.pathDomainHeader} onPress={() => onDomain(domain)}>
                  <View style={[styles.domainIcon, { backgroundColor: `${domain.color}18` }]}><Ionicons name={domain.icon} size={19} color={domain.color} /></View>
                  <View style={styles.flexOne}>
                    <Text style={styles.domainTitle}>{domain.title}</Text>
                    <Text style={styles.domainMeta}>{domain.weight}% exam weight · {visibleTopics.length} topics</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#A4ADBA" />
                </Pressable>
                {visibleTopics.slice(0, 2).map((topic) => (
                  <Pressable key={topic.id} style={styles.previewTopic} onPress={() => onOpenTopic(topic)}>
                    <View style={styles.previewDot} />
                    <Text style={styles.previewTopicText}>{topic.title}</Text>
                    {completed.includes(topic.id) && <Ionicons name="checkmark-circle" size={17} color={colors.green} />}
                  </Pressable>
                ))}
              </View>
            );
          })}
          {search && !domains.some((domain) => topicsForDomain(domain).length > 0) && <Text style={styles.emptySearch}>No topics found. Try a different search.</Text>}
        </View>
      )}
    </View>
  );
}

function LabsScreen({
  prefix, hostCount, onPrefix, completed, onOpen,
}: {
  prefix: string; hostCount: number | null; onPrefix: (value: string) => void;
  completed: boolean; onOpen: () => void;
}) {
  const [lab, setLab] = useState<"Subnet" | "VLAN" | "ACL">("Subnet");
  const [portVlans, setPortVlans] = useState(["10", "10", "20", "20"]);
  const [aclSource, setAclSource] = useState<"Trusted" | "Guest">("Trusted");
  const parsedPrefix = Number.parseInt(prefix, 10);
  const isValid = Number.isInteger(parsedPrefix) && parsedPrefix >= 0 && parsedPrefix <= 32;
  const subnetFormula = !isValid
    ? "Enter a prefix from 0 to 32"
    : parsedPrefix === 32
      ? "/32 identifies one host route"
      : parsedPrefix === 31
        ? "/31 provides two endpoint addresses on a point-to-point link"
        : `2⁽³²⁻${parsedPrefix}⁾ − 2 = ${hostCount} usable host addresses`;
  return (
    <View>
      <Header eyebrow="Practice by doing" title="The lab bench." subtitle="Get hands-on with the concepts that make networks click." />
      <View style={styles.labSelector}>
        {(["Subnet", "VLAN", "ACL"] as const).map((name) => (
          <Pressable key={name} onPress={() => setLab(name)} style={[styles.labSelectorItem, lab === name && styles.labSelectorItemActive]}>
            <Text style={[styles.labSelectorText, lab === name && styles.labSelectorTextActive]}>{name}</Text>
          </Pressable>
        ))}
      </View>
      {lab === "Subnet" && (
        <View>
          <View style={styles.labFeature}>
            <View style={styles.labCardTop}>
              <View style={styles.labTag}><View style={styles.liveDot} /><Text style={styles.labTagText}>INTERACTIVE LAB</Text></View>
              <Ionicons name="git-branch-outline" size={21} color="#A8C4FF" />
            </View>
            <Text style={styles.labTitle}>Subnetting workbench</Text>
            <Text style={styles.labCopy}>Change the prefix and see how many host addresses fit in your network.</Text>
            <View style={styles.networkDisplay}>
              <Text style={styles.networkAddress}>192.168.10.0</Text>
              <View style={styles.prefixInputWrap}>
                <Text style={styles.slash}>/</Text>
                <TextInput
                  accessibilityLabel="Subnet prefix length"
                  value={prefix}
                  onChangeText={(value) => onPrefix(value.replace(/[^0-9]/g, "").slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                  style={styles.prefixInput}
                />
              </View>
            </View>
            <View style={styles.resultRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>USABLE HOSTS</Text>
                <Text style={styles.resultValue}>{isValid ? hostCount?.toLocaleString() : "—"}</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>TOTAL ADDRESSES</Text>
                <Text style={styles.resultValue}>{isValid ? (2 ** (32 - parsedPrefix)).toLocaleString() : "—"}</Text>
              </View>
            </View>
            <Text style={styles.labFormula}>{subnetFormula}</Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={19} color="#D79032" />
            <Text style={styles.tipText}><Text style={styles.tipStrong}>Quick tip: </Text>A /26 leaves 6 host bits, so 2⁶ = 64 total addresses and 62 traditionally usable hosts.</Text>
          </View>
          <Text style={styles.sectionTitle}>Guided practice</Text>
          <Pressable style={styles.guidedCard} onPress={onOpen}>
            <View style={styles.guidedIcon}><Ionicons name={completed ? "checkmark-circle" : "play"} size={19} color={completed ? colors.green : colors.blue} /></View>
            <View style={styles.flexOne}>
              <Text style={styles.guidedTitle}>IPv4 subnetting walkthrough</Text>
              <Text style={styles.guidedMeta}>{completed ? "COMPLETED" : "5 MIN · BEGINNER"}</Text>
            </View>
            <Ionicons name="arrow-forward" size={17} color={colors.blue} />
          </Pressable>
        </View>
      )}
      {lab === "VLAN" && (
        <View style={styles.simulationCard}>
          <Text style={styles.simTitle}>Switch port VLAN simulator</Text>
          <Text style={styles.simCopy}>Tap a port to move it between VLAN 10 (Staff) and VLAN 20 (Guest).</Text>
          <View style={styles.simSwitch}><Ionicons name="git-network-outline" size={22} color={colors.blue} /><Text style={styles.simSwitchName}>ACCESS SWITCH · SW1</Text></View>
          {portVlans.map((vlan, index) => (
            <Pressable key={`port-${index}`} onPress={() => setPortVlans((current) => current.map((value, portIndex) => portIndex === index ? value === "10" ? "20" : "10" : value))} style={styles.portRow}>
              <View style={[styles.portLed, { backgroundColor: vlan === "10" ? "#3978F6" : "#8B64DA" }]} />
              <Text style={styles.portName}>Gi1/0/{index + 1}</Text>
              <View style={[styles.vlanChip, { backgroundColor: vlan === "10" ? "#EAF1FF" : "#F0EBFC" }]}><Text style={[styles.vlanChipText, { color: vlan === "10" ? colors.blue : "#7957C5" }]}>VLAN {vlan}</Text></View>
              <Text style={styles.portRole}>{vlan === "10" ? "Staff" : "Guest"}</Text>
              <Ionicons name="swap-horizontal" size={17} color="#8A96A7" />
            </Pressable>
          ))}
          <View style={styles.simFeedback}><Ionicons name="information-circle-outline" size={18} color={colors.blue} /><Text style={styles.simFeedbackText}>Ports in the same VLAN share a Layer 2 broadcast domain. Routing is needed between VLAN 10 and VLAN 20.</Text></View>
        </View>
      )}
      {lab === "ACL" && (
        <View style={styles.simulationCard}>
          <Text style={styles.simTitle}>ACL decision simulator</Text>
          <Text style={styles.simCopy}>Rule: permit HTTPS from 192.168.10.0/24 to the company server; deny other sources.</Text>
          <Text style={styles.simFieldLabel}>SELECT A SOURCE</Text>
          <View style={styles.sourceChoices}>
            {(["Trusted", "Guest"] as const).map((source) => (
              <Pressable key={source} onPress={() => setAclSource(source)} style={[styles.sourceChoice, aclSource === source && styles.sourceChoiceSelected]}>
                <Ionicons name={source === "Trusted" ? "business-outline" : "people-outline"} size={17} color={aclSource === source ? colors.blue : colors.muted} />
                <View><Text style={styles.sourceChoiceTitle}>{source} network</Text><Text style={styles.sourceChoiceIp}>{source === "Trusted" ? "192.168.10.25" : "192.168.20.25"}</Text></View>
              </Pressable>
            ))}
          </View>
          <View style={[styles.aclVerdict, aclSource === "Trusted" ? styles.aclAllow : styles.aclDeny]}>
            <Ionicons name={aclSource === "Trusted" ? "checkmark-circle" : "close-circle"} size={25} color={aclSource === "Trusted" ? colors.green : "#C45461"} />
            <View style={styles.flexOne}>
              <Text style={[styles.aclVerdictTitle, { color: aclSource === "Trusted" ? colors.green : "#C45461" }]}>{aclSource === "Trusted" ? "PERMIT" : "DENY"}</Text>
              <Text style={styles.aclVerdictCopy}>{aclSource === "Trusted" ? "First matching rule allows HTTPS from this trusted subnet." : "No permit rule matches; the implicit deny blocks this source."}</Text>
            </View>
          </View>
        </View>
      )}
      <Text style={styles.footerNote}>Interactive learning simulations; no network equipment is configured.</Text>
    </View>
  );
}

function ResourcesScreen({
  notes, onAddNote, onDeleteNote,
}: {
  notes: StudyNote[]; onAddNote: (text: string) => void; onDeleteNote: (id: string) => void;
}) {
  const [section, setSection] = useState<"Glossary" | "Notes">("Glossary");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const matchingTerms = glossary.filter((entry) =>
    !normalizedSearch ||
    entry.term.toLowerCase().includes(normalizedSearch) ||
    entry.definition.toLowerCase().includes(normalizedSearch) ||
    entry.domain.toLowerCase().includes(normalizedSearch)
  );
  const matchingNotes = notes.filter((note) => !normalizedSearch || note.text.toLowerCase().includes(normalizedSearch));

  return (
    <View>
      <Header eyebrow="Quick reference" title={section === "Glossary" ? "Network, in plain English." : "Your study notebook."} subtitle={section === "Glossary" ? "A pocket reference for the terms you'll see throughout the course." : "Your notes stay saved on this device."} />
      <View style={styles.resourceSwitch}>
        {(["Glossary", "Notes"] as const).map((item) => (
          <Pressable key={item} onPress={() => { setSection(item); setSearch(""); }} style={[styles.resourceSwitchItem, section === item && styles.resourceSwitchItemActive]}>
            <Ionicons name={item === "Glossary" ? "book-outline" : "create-outline"} size={15} color={section === item ? colors.blue : colors.muted} />
            <Text style={[styles.resourceSwitchText, section === item && styles.resourceSwitchTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      {section === "Notes" && (
        <View style={styles.noteComposer}>
          <Text style={styles.noteComposerTitle}>Capture a useful takeaway</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="For example: /27 leaves 5 host bits..."
            placeholderTextColor="#9AA4B2"
            multiline
            textAlignVertical="top"
            style={styles.noteInput}
            accessibilityLabel="Write a study note"
          />
          <Pressable
            disabled={!draft.trim()}
            onPress={() => {
              const value = draft.trim();
              if (!value) return;
              onAddNote(value);
              setDraft("");
            }}
            style={[styles.addNoteButton, !draft.trim() && styles.addNoteButtonDisabled]}
          >
            <Ionicons name="add" size={17} color="#FFFFFF" /><Text style={styles.addNoteText}>Save note</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput value={search} onChangeText={setSearch} placeholder={section === "Glossary" ? "Search networking terms" : "Search your notes"} placeholderTextColor="#9AA4B2" style={styles.searchInput} />
        {search.length > 0 && <Pressable onPress={() => setSearch("")}><Ionicons name="close-circle" size={17} color="#A4ADBA" /></Pressable>}
      </View>
      {section === "Glossary" ? (
        matchingTerms.map((entry) => (
          <View key={entry.term} style={styles.glossaryCard}>
            <View style={styles.glossaryTop}>
              <Text style={styles.glossaryTerm}>{entry.term}</Text>
              <Text style={styles.glossaryDomain}>{entry.domain.toUpperCase()}</Text>
            </View>
            <Text style={styles.glossaryDefinition}>{entry.definition}</Text>
          </View>
        ))
      ) : matchingNotes.length > 0 ? (
        matchingNotes.map((note) => (
          <View key={note.id} style={styles.savedNoteCard}>
            <View style={styles.savedNoteTop}>
              <Text style={styles.savedNoteDate}>{new Date(note.createdAt).toLocaleDateString()}</Text>
              <Pressable onPress={() => onDeleteNote(note.id)} accessibilityRole="button" accessibilityLabel="Delete note">
                <Ionicons name="trash-outline" size={16} color="#C45461" />
              </Pressable>
            </View>
            <Text style={styles.savedNoteText}>{note.text}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyNotes}>
          <Ionicons name="document-text-outline" size={25} color="#9AA4B2" />
          <Text style={styles.emptyNotesTitle}>{normalizedSearch ? "No matching notes" : "Your notebook is ready"}</Text>
          <Text style={styles.emptyNotesCopy}>{normalizedSearch ? "Try another search term." : "Save a concept, command, or reminder above."}</Text>
        </View>
      )}
      {section === "Glossary" && matchingTerms.length === 0 && <Text style={styles.emptySearch}>No matching terms. Try another search.</Text>}
      <Text style={styles.footerNote}>Definitions are concise study aids; verify configuration details against current Cisco documentation.</Text>
    </View>
  );
}

function ProfileScreen({ completedCount, streak, bestExamScore, onReset }: { completedCount: number; streak: number; bestExamScore: number | null; onReset: () => void }) {
  return (
    <View>
      <Header eyebrow="Your progress" title="Look how far you've come." subtitle="Every concept learned is one step closer to exam day." />
      <View style={styles.profileHero}>
        <View style={styles.avatar}><Ionicons name="person" size={28} color={colors.blue} /></View>
        <Text style={styles.profileName}>Network learner</Text>
        <Text style={styles.profileSubtitle}>CCNA 200-301 study journey</Text>
      </View>
      <View style={styles.profileStats}>
        <View style={styles.profileStat}><Text style={styles.profileStatValue}>{completedCount}</Text><Text style={styles.profileStatLabel}>LESSONS DONE</Text></View>
        <View style={styles.profileStatDivider} />
        <View style={styles.profileStat}><Text style={styles.profileStatValue}>{streak}</Text><Text style={styles.profileStatLabel}>DAY STREAK</Text></View>
        <View style={styles.profileStatDivider} />
        <View style={styles.profileStat}><Text style={styles.profileStatValue}>{curriculum.length}</Text><Text style={styles.profileStatLabel}>DOMAINS</Text></View>
      </View>
      <View style={styles.bestScoreCard}>
        <View style={styles.bestScoreIcon}><Ionicons name="trophy-outline" size={20} color="#D79032" /></View>
        <View style={styles.flexOne}><Text style={styles.bestScoreTitle}>Practice exam best</Text><Text style={styles.bestScoreCopy}>Your highest score on this device</Text></View>
        <Text style={styles.bestScoreValue}>{bestExamScore === null ? "—" : `${bestExamScore}%`}</Text>
      </View>
      <Text style={styles.sectionTitle}>Exam blueprint</Text>
      <Text style={[styles.sectionIntro, { marginBottom: 12 }]}>Study time follows the official domain weighting.</Text>
      {curriculum.map((domain) => (
        <View key={domain.id} style={styles.blueprintRow}>
          <View style={[styles.blueprintDot, { backgroundColor: domain.color }]} />
          <Text style={styles.blueprintName}>{domain.title}</Text>
          <Text style={styles.blueprintWeight}>{domain.weight}%</Text>
        </View>
      ))}
      <View style={styles.profileNote}>
        <Ionicons name="phone-portrait-outline" size={20} color={colors.blue} />
        <View style={styles.flexOne}>
          <Text style={styles.profileNoteTitle}>Your progress stays on this device</Text>
          <Text style={styles.profileNoteCopy}>Lessons completed are saved locally on your phone.</Text>
        </View>
      </View>
      <Pressable onPress={onReset} style={styles.resetButton}><Text style={styles.resetText}>Reset learning progress</Text></Pressable>
      <Text style={styles.footerNote}>PacketPath is an independent study companion, not an official Cisco product.</Text>
    </View>
  );
}

function LessonScreen({
  topic, completed, selectedAnswer, onSelectAnswer, onBack, onComplete,
}: {
  topic: Topic & { domainId: string; domainTitle: string; domainColor: string };
  completed: boolean; selectedAnswer: number | null; onSelectAnswer: (answer: number) => void;
  onBack: () => void; onComplete: () => void;
}) {
  const question = quizBank[topic.id];
  const isSubnetLesson = topic.id === "ipv4-subnetting";
  const correctAnswer = question.answer;
  return (
    <View style={styles.lessonScreen}>
      <View style={styles.lessonTopBar}>
        <Pressable style={styles.lessonBack} onPress={onBack}><Ionicons name="arrow-back" size={20} color={colors.ink} /></Pressable>
        <View style={styles.lessonProgressTrack}><View style={[styles.lessonProgressFill, { backgroundColor: topic.domainColor, width: completed || selectedAnswer === correctAnswer ? "100%" : selectedAnswer !== null ? "70%" : "45%" }]} /></View>
        <Text style={styles.lessonStep}>{completed ? "DONE" : selectedAnswer === correctAnswer ? "2/2" : selectedAnswer !== null ? "REVIEW" : "1/2"}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.lessonScroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.lessonTag, { backgroundColor: `${topic.domainColor}15` }]}>
          <View style={[styles.lessonTagDot, { backgroundColor: topic.domainColor }]} />
          <Text style={[styles.lessonTagText, { color: topic.domainColor }]}>{topic.domainTitle.toUpperCase()}</Text>
        </View>
        <Text style={styles.lessonTitle}>{topic.title}</Text>
        <Text style={styles.lessonLead}>{topic.explanation}</Text>
        <View style={styles.lessonVisual}>
          {isSubnetLesson ? <SubnetVisual /> : <GenericVisual topic={topic} />}
        </View>
        <View style={styles.exampleCard}>
          <View style={styles.exampleHeader}><Ionicons name="sparkles-outline" size={17} color="#D79032" /><Text style={styles.exampleLabel}>REAL-WORLD EXAMPLE</Text></View>
          <Text style={styles.exampleText}>{topic.example}</Text>
        </View>
        {question ? (
          <View style={styles.quizCard}>
            <Text style={styles.quizEyebrow}>QUICK CHECK</Text>
            <Text style={styles.quizQuestion}>{question.prompt}</Text>
            {question.choices.map((answer, index) => {
              const chosen = selectedAnswer === index;
              const correct = index === correctAnswer;
              return (
                <Pressable
                  key={answer}
                  onPress={() => onSelectAnswer(index)}
                  style={[
                    styles.answerOption,
                    chosen && correct && styles.answerCorrect,
                    chosen && !correct && styles.answerIncorrect,
                    selectedAnswer !== null && correct && styles.answerCorrect,
                  ]}
                >
                  <View style={[styles.answerRadio, (chosen || (selectedAnswer !== null && correct)) && styles.answerRadioSelected]}>
                    {(chosen || (selectedAnswer !== null && correct)) && <View style={styles.answerRadioDot} />}
                  </View>
                  <Text style={styles.answerText}>{answer}</Text>
                  {selectedAnswer !== null && correct && <Ionicons name="checkmark-circle" size={18} color={colors.green} />}
                </Pressable>
              );
            })}
            {selectedAnswer !== null && (
              <View style={[styles.answerFeedback, selectedAnswer === correctAnswer ? styles.feedbackGood : styles.feedbackTry]}>
                <Text style={styles.feedbackText}>
                  {selectedAnswer === correctAnswer
                    ? question.explanation
                    : `Not quite. ${question.explanation}`}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.keyIdeaCard}>
            <Ionicons name="bookmark-outline" size={17} color={colors.blue} />
            <View style={styles.flexOne}>
              <Text style={styles.keyIdeaLabel}>KEY IDEA</Text>
              <Text style={styles.keyIdeaText}>{topic.explanation}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.lessonFooter}>
        <Pressable
          onPress={onComplete}
          disabled={!completed && selectedAnswer !== correctAnswer}
          style={[styles.primaryButton, !completed && selectedAnswer !== correctAnswer && styles.primaryButtonDisabled]}
        >
          <Text style={styles.primaryButtonText}>{completed ? "Back to learning path" : "Mark lesson complete"}</Text>
          <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

type PracticeQuestion = {
  topicTitle: string;
  domainTitle: string;
  domainColor: string;
  question: QuizQuestion;
};

function makePracticeSet(): PracticeQuestion[] {
  const questionCounts = [2, 2, 3, 1, 2, 2];
  const selected: PracticeQuestion[] = [];
  curriculum.forEach((domain, domainIndex) => {
    const domainQuestions = domain.topics.flatMap((topic) => {
      const question = quizBank[topic.id];
      return question ? [{ topicTitle: topic.title, domainTitle: domain.title, domainColor: domain.color, question }] : [];
    });
    for (let index = domainQuestions.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [domainQuestions[index], domainQuestions[swapIndex]] = [domainQuestions[swapIndex], domainQuestions[index]];
    }
    selected.push(...domainQuestions.slice(0, questionCounts[domainIndex]));
  });
  return selected;
}

function PracticeExam({
  onExit, onResult, bestScore,
}: {
  onExit: () => void; onResult: (score: number) => void; bestScore: number | null;
}) {
  const [questions, setQuestions] = useState(makePracticeSet);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const score = questions.reduce((total, item, index) => total + (answers[index] === item.question.answer ? 1 : 0), 0);
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => setSecondsLeft((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  useEffect(() => {
    if (secondsLeft === 0 && !submitted) setSubmitted(true);
  }, [secondsLeft, submitted]);

  useEffect(() => {
    if (submitted) onResult(Math.round((score / questions.length) * 100));
  }, [submitted, score, questions.length, onResult]);

  const restart = () => {
    const nextQuestions = makePracticeSet();
    setQuestions(nextQuestions);
    setAnswers(nextQuestions.map(() => null));
    setCurrentIndex(0);
    setSecondsLeft(15 * 60);
    setSubmitted(false);
    setReviewOpen(false);
  };

  const leave = () => {
    if (!submitted) {
      Alert.alert("Leave practice exam?", "Your answers in this attempt will be lost.", [
        { text: "Stay", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: onExit },
      ]);
      return;
    }
    onExit();
  };

  const timeLabel = `${Math.floor(secondsLeft / 60).toString().padStart(2, "0")}:${(secondsLeft % 60).toString().padStart(2, "0")}`;

  return (
    <View style={styles.examScreen}>
      <View style={styles.examHeader}>
        <Pressable style={styles.lessonBack} onPress={leave}><Ionicons name="close" size={20} color={colors.ink} /></Pressable>
        <View style={styles.flexOne}>
          <Text style={styles.examHeaderTitle}>{submitted ? "Exam results" : "Practice exam"}</Text>
          <Text style={styles.examHeaderSubtitle}>CCNA 200-301 · 12 questions</Text>
        </View>
        {!submitted && <View style={[styles.timerBadge, secondsLeft < 60 && styles.timerUrgent]}><Ionicons name="time-outline" size={15} color={secondsLeft < 60 ? "#C45461" : colors.blue} /><Text style={[styles.timerText, secondsLeft < 60 && styles.timerTextUrgent]}>{timeLabel}</Text></View>}
      </View>
      {submitted ? (
        <ScrollView contentContainerStyle={styles.examResultContent} showsVerticalScrollIndicator={false}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scorePercent}>{Math.round((score / questions.length) * 100)}%</Text>
            <Text style={styles.scoreCaption}>YOUR SCORE</Text>
          </View>
          <Text style={styles.resultTitle}>{score >= 9 ? "Strong work." : "Good practice."}</Text>
          <Text style={styles.resultSubtitle}>{score} of {questions.length} correct · Best score {Math.max(bestScore ?? 0, Math.round((score / questions.length) * 100))}%</Text>
          <View style={styles.resultTip}>
            <Ionicons name="bulb-outline" size={18} color="#D79032" />
            <Text style={styles.resultTipText}>{score >= 9 ? "Review any missed answers to reinforce the details." : "Revisit missed topics in the learning path, then give it another try."}</Text>
          </View>
          <Pressable style={styles.reviewToggle} onPress={() => setReviewOpen((open) => !open)}>
            <Text style={styles.reviewToggleText}>{reviewOpen ? "Hide answer review" : "Review answers"}</Text>
            <Ionicons name={reviewOpen ? "chevron-up" : "chevron-down"} size={17} color={colors.blue} />
          </Pressable>
          {reviewOpen && questions.map((item, index) => {
            const correct = answers[index] === item.question.answer;
            const selectedAnswer = answers[index];
            return (
              <View key={`${item.topicTitle}-${index}`} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={[styles.lessonTagDot, { backgroundColor: correct ? colors.green : "#D77978" }]} />
                  <Text style={styles.reviewTopic}>{item.topicTitle}</Text>
                  <Text style={[styles.reviewMark, { color: correct ? colors.green : "#C45461" }]}>{correct ? "CORRECT" : "REVIEW"}</Text>
                </View>
                <Text style={styles.reviewQuestion}>{item.question.prompt}</Text>
                <Text style={styles.reviewSelected}>Your answer: {selectedAnswer === null ? "Not answered" : item.question.choices[selectedAnswer]}</Text>
                <Text style={styles.reviewAnswer}>Answer: {item.question.choices[item.question.answer]}</Text>
                <Text style={styles.reviewExplanation}>{item.question.explanation}</Text>
              </View>
            );
          })}
          <Pressable style={styles.primaryButton} onPress={restart}><Text style={styles.primaryButtonText}>Try another practice set</Text><Ionicons name="refresh" size={17} color="#FFFFFF" /></Pressable>
          <Pressable style={styles.exitExamButton} onPress={onExit}><Text style={styles.exitExamText}>Back to learning</Text></Pressable>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.examContent} showsVerticalScrollIndicator={false}>
          <View style={styles.examProgressRow}>
            <Text style={styles.examProgressLabel}>QUESTION {currentIndex + 1} OF {questions.length}</Text>
            <Text style={styles.examAnswered}>{answers.filter((answer) => answer !== null).length} answered</Text>
          </View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} /></View>
          <View style={styles.examDomainTag}><View style={[styles.lessonTagDot, { backgroundColor: currentQuestion.domainColor }]} /><Text style={styles.examDomainText}>{currentQuestion.domainTitle.toUpperCase()}</Text></View>
          <Text style={styles.examQuestionTitle}>{currentQuestion.question.prompt}</Text>
          <Text style={styles.examHint}>Choose the best answer.</Text>
          {currentQuestion.question.choices.map((choice, index) => {
            const selected = answers[currentIndex] === index;
            return (
              <Pressable key={choice} style={[styles.examOption, selected && styles.examOptionSelected]} onPress={() => setAnswers((previous) => previous.map((answer, answerIndex) => answerIndex === currentIndex ? index : answer))}>
                <View style={[styles.examOptionLetter, selected && styles.examOptionLetterSelected]}><Text style={[styles.examOptionLetterText, selected && styles.examOptionLetterTextSelected]}>{String.fromCharCode(65 + index)}</Text></View>
                <Text style={[styles.examOptionText, selected && styles.examOptionTextSelected]}>{choice}</Text>
                {selected && <Ionicons name="checkmark-circle" size={18} color={colors.blue} />}
              </Pressable>
            );
          })}
          <View style={styles.examNavigation}>
            <Pressable style={[styles.examNavButton, currentIndex === 0 && styles.examNavDisabled]} disabled={currentIndex === 0} onPress={() => setCurrentIndex((index) => index - 1)}>
              <Ionicons name="arrow-back" size={15} color={currentIndex === 0 ? "#B5BDC9" : colors.blue} /><Text style={[styles.examNavText, currentIndex === 0 && styles.examNavTextDisabled]}>Previous</Text>
            </Pressable>
            {currentIndex < questions.length - 1 ? (
              <Pressable style={styles.examNextButton} onPress={() => setCurrentIndex((index) => index + 1)}><Text style={styles.examNextText}>Next question</Text><Ionicons name="arrow-forward" size={15} color="#FFFFFF" /></Pressable>
            ) : (
              <Pressable style={styles.examSubmitButton} onPress={() => setSubmitted(true)}><Text style={styles.examNextText}>Finish exam</Text><Ionicons name="checkmark" size={16} color="#FFFFFF" /></Pressable>
            )}
          </View>
          <Pressable onPress={() => setSubmitted(true)} style={styles.finishEarly}><Text style={styles.finishEarlyText}>Finish and see results</Text></Pressable>
        </ScrollView>
      )}
    </View>
  );
}

function SubnetVisual() {
  return (
    <View style={styles.subnetVisual}>
      <Text style={styles.visualCaption}>A /26 SUBNET AT A GLANCE</Text>
      <View style={styles.addressBlocks}>
        <View style={styles.networkBlock}><Text style={styles.blockTop}>NETWORK</Text><Text style={styles.blockBottom}>.0</Text></View>
        <View style={styles.hostBlock}><Text style={styles.blockTop}>USABLE HOSTS</Text><Text style={styles.blockBottom}>.1 – .62</Text></View>
        <View style={styles.broadcastBlock}><Text style={styles.blockTop}>BROADCAST</Text><Text style={styles.blockBottom}>.63</Text></View>
      </View>
      <View style={styles.bitRow}><Text style={styles.bitLabel}>HOST BITS</Text><Text style={styles.bitValue}>6 bits  →  2⁶ = 64 addresses</Text></View>
    </View>
  );
}

function GenericVisual({ topic }: { topic: Topic }) {
  const words = topic.title.split(" ").filter(Boolean).slice(0, 4);
  return (
    <View style={styles.genericVisual}>
      <View style={styles.genericVisualIcon}><Ionicons name="git-network-outline" size={28} color={colors.blue} /></View>
      <View style={styles.genericVisualDivider} />
      <View style={styles.genericConcepts}>
        {words.map((word, index) => (
          <View key={`${word}-${index}`} style={styles.conceptPill}><Text style={styles.conceptText}>{word}</Text></View>
        ))}
      </View>
      <Text style={styles.visualCaption}>CONCEPT SNAPSHOT</Text>
    </View>
  );
}

function TabBar({ current, onChange }: { current: Tab; onChange: (tab: Tab) => void }) {
  const items: { label: Tab; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
    { label: "Learn", icon: "home-outline", activeIcon: "home" },
    { label: "Path", icon: "map-outline", activeIcon: "map" },
    { label: "Labs", icon: "flask-outline", activeIcon: "flask" },
    { label: "Resources", icon: "book-outline", activeIcon: "book" },
    { label: "Profile", icon: "person-outline", activeIcon: "person" },
  ];
  return (
    <View style={styles.tabBar}>
      {items.map((item) => {
        const active = current === item.label;
        return (
          <Pressable key={item.label} style={styles.tabItem} onPress={() => onChange(item.label)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
            <Ionicons name={active ? item.activeIcon : item.icon} size={21} color={active ? colors.blue : "#9AA4B2"} />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  app: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 28 },
  header: { marginBottom: 22 },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  brandMark: { height: 30, width: 30, borderRadius: 10, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center", marginRight: 9 },
  brand: { fontSize: 16, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
  streakBadge: { marginLeft: "auto", flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line },
  streakFlame: { color: "#E8943F", fontSize: 13, marginRight: 5 },
  streakText: { color: colors.ink, fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
  eyebrow: { color: colors.blue, fontSize: 10, fontWeight: "800", letterSpacing: 1.4, marginBottom: 8 },
  pageTitle: { color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: "800", letterSpacing: -0.9 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 330 },
  statsRow: { flexDirection: "row", gap: 11, marginBottom: 26 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 15, borderWidth: 1, borderColor: colors.line },
  statCardBlue: { backgroundColor: colors.navy, borderColor: colors.navy },
  statLabel: { fontSize: 9, color: "#9AA8BC", fontWeight: "800", letterSpacing: 1 },
  statValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginTop: 7, letterSpacing: -0.4 },
  statHint: { fontSize: 10, color: "#9AA8BC", marginTop: 5 },
  statEmoji: { fontSize: 15, color: "#F1B359" },
  statSmall: { fontSize: 14, color: "#AAB4C3", fontWeight: "600" },
  examLaunchCard: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE6F8", borderRadius: 15, padding: 13, marginTop: -14, marginBottom: 23 },
  examLaunchIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center" },
  examLaunchTitle: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  examLaunchCopy: { color: colors.muted, fontSize: 9, marginTop: 4 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  smallMuted: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  linkText: { color: colors.blue, fontSize: 12, fontWeight: "700" },
  continueCard: { backgroundColor: colors.surface, borderRadius: 17, padding: 16, marginTop: 7, marginBottom: 25, borderWidth: 1, borderColor: colors.line, shadowColor: "#17345E", shadowOpacity: 0.04, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  continueTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  continueIcon: { height: 36, width: 36, borderRadius: 12, backgroundColor: colors.paleBlue, alignItems: "center", justifyContent: "center" },
  continueBadge: { backgroundColor: "#FFF4E6", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  continueBadgeText: { fontSize: 9, color: "#C47A23", letterSpacing: 0.8, fontWeight: "800" },
  continueTitle: { color: colors.ink, fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },
  continueCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  continueBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  continueMeta: { fontSize: 8, color: "#8A96A7", fontWeight: "800", letterSpacing: 0.65 },
  roundArrow: { height: 30, width: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.blue },
  sectionIntro: { fontSize: 11, color: colors.muted, marginTop: 1, marginBottom: 12 },
  domainCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.line },
  domainIcon: { height: 39, width: 39, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 11 },
  flexOne: { flex: 1 },
  domainTitle: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  domainMeta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  miniLabCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0EBFC", borderRadius: 15, padding: 14, marginTop: 13 },
  miniLabIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginRight: 11 },
  miniLabTitle: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  miniLabCopy: { color: colors.muted, fontSize: 10, marginTop: 4 },
  textArrow: { padding: 7 },
  resourceLaunchCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#EAF6F2", borderRadius: 14, padding: 12, marginTop: 9 },
  resourceLaunchIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  resourceLaunchTitle: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  resourceLaunchCopy: { color: colors.muted, fontSize: 9, marginTop: 4 },
  footerNote: { textAlign: "center", color: "#97A1AF", fontSize: 10, lineHeight: 15, marginTop: 22, marginBottom: 8 },
  tabBar: { height: 66, flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: colors.line, paddingBottom: 4 },
  tabItem: { flex: 1, height: 55, alignItems: "center", justifyContent: "center", gap: 4 },
  tabLabel: { fontSize: 9, color: "#9AA4B2", fontWeight: "600" },
  tabLabelActive: { color: colors.blue, fontWeight: "800" },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 12, height: 45, gap: 9, marginBottom: 13 },
  searchInput: { flex: 1, color: colors.ink, fontSize: 12, paddingVertical: 0 },
  resourceSwitch: { flexDirection: "row", backgroundColor: "#E9EDF4", borderRadius: 12, padding: 4, marginTop: -8, marginBottom: 13 },
  resourceSwitchItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 9 },
  resourceSwitchItemActive: { backgroundColor: "#FFFFFF" },
  resourceSwitchText: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  resourceSwitchTextActive: { color: colors.blue, fontWeight: "800" },
  noteComposer: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 12, marginBottom: 12 },
  noteComposerTitle: { color: colors.ink, fontSize: 10, fontWeight: "800", marginBottom: 8 },
  noteInput: { minHeight: 77, color: colors.ink, fontSize: 11, lineHeight: 17, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 10 },
  addNoteButton: { alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: colors.blue, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8, marginTop: 9 },
  addNoteButtonDisabled: { backgroundColor: "#A8BCE1" },
  addNoteText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  glossaryCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, marginBottom: 8 },
  glossaryTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  glossaryTerm: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  glossaryDomain: { color: colors.blue, fontSize: 7, fontWeight: "800", letterSpacing: 0.5, flexShrink: 1, textAlign: "right" },
  glossaryDefinition: { color: "#657287", fontSize: 10, lineHeight: 15, marginTop: 6 },
  savedNoteCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, marginBottom: 8 },
  savedNoteTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  savedNoteDate: { color: colors.muted, fontSize: 8, fontWeight: "700" },
  savedNoteText: { color: colors.ink, fontSize: 10, lineHeight: 16, marginTop: 8 },
  emptyNotes: { alignItems: "center", paddingVertical: 28, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 13, marginTop: 5 },
  emptyNotesTitle: { color: colors.ink, fontSize: 11, fontWeight: "800", marginTop: 10 },
  emptyNotesCopy: { color: colors.muted, fontSize: 9, marginTop: 5 },
  overallProgress: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, marginBottom: 13 },
  progressTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  overallLabel: { color: colors.ink, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  overallCount: { color: colors.muted, fontSize: 10 },
  progressTrack: { height: 5, backgroundColor: "#EDF0F6", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.blue, borderRadius: 4 },
  pathDomain: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  pathDomainHeader: { flexDirection: "row", alignItems: "center", paddingVertical: 9 },
  previewTopic: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingLeft: 5, borderTopWidth: 1, borderTopColor: "#F1F3F7" },
  previewDot: { height: 5, width: 5, borderRadius: 3, backgroundColor: "#C3CBD6", marginRight: 9 },
  previewTopicText: { flex: 1, color: "#647186", fontSize: 10 },
  emptySearch: { textAlign: "center", color: colors.muted, fontSize: 12, marginVertical: 30 },
  backLink: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: -4, marginBottom: 17 },
  backLinkText: { color: colors.blue, fontSize: 12, fontWeight: "700" },
  domainSummary: { backgroundColor: "#FFFFFF", borderRadius: 15, borderWidth: 1, borderColor: colors.line, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  domainIconLarge: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 },
  domainSummaryTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  domainSummaryMeta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  topicRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 11, marginBottom: 8 },
  topicNumber: { height: 27, width: 27, borderRadius: 10, backgroundColor: "#F0F3F8", alignItems: "center", justifyContent: "center" },
  topicNumberDone: { backgroundColor: colors.green },
  topicNumberText: { color: "#79869A", fontSize: 9, fontWeight: "800" },
  topicTitle: { color: colors.ink, fontSize: 11, fontWeight: "700" },
  topicDescription: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 4 },
  labFeature: { backgroundColor: colors.navy, borderRadius: 18, padding: 17, marginBottom: 13 },
  labSelector: { flexDirection: "row", backgroundColor: "#E9EDF4", borderRadius: 12, padding: 4, marginTop: -7, marginBottom: 14 },
  labSelectorItem: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 9 },
  labSelectorItemActive: { backgroundColor: "#FFFFFF", shadowColor: "#203550", shadowOpacity: 0.08, shadowRadius: 5, elevation: 1 },
  labSelectorText: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  labSelectorTextActive: { color: colors.blue, fontWeight: "800" },
  labCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  labTag: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6BE0B3", marginRight: 6 },
  labTagText: { color: "#D8E6FA", fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  labTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "800", marginTop: 16, letterSpacing: -0.4 },
  labCopy: { color: "#B1C0D4", fontSize: 11, lineHeight: 17, marginTop: 5 },
  networkDisplay: { height: 56, borderRadius: 12, backgroundColor: "#203958", marginTop: 17, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  networkAddress: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"], letterSpacing: 0.1 },
  prefixInputWrap: { flexDirection: "row", alignItems: "center" },
  slash: { color: "#A9BEDA", fontSize: 18, fontWeight: "700" },
  prefixInput: { color: "#83B0FF", fontSize: 18, fontWeight: "800", minWidth: 28, padding: 0, textAlign: "left" },
  resultRow: { flexDirection: "row", marginTop: 16, alignItems: "center" },
  resultItem: { flex: 1 },
  resultDivider: { height: 29, width: 1, backgroundColor: "#3C5371", marginHorizontal: 13 },
  resultLabel: { color: "#95A9C4", fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  resultValue: { color: "#FFFFFF", fontSize: 19, fontWeight: "800", marginTop: 5 },
  labFormula: { color: "#A9BEDA", fontSize: 10, textAlign: "center", marginTop: 14, backgroundColor: "#203958", paddingVertical: 9, borderRadius: 9 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 9, backgroundColor: "#FFF8ED", borderWidth: 1, borderColor: "#F5E8D3", borderRadius: 13, padding: 13, marginBottom: 22 },
  tipText: { flex: 1, color: "#796849", fontSize: 10, lineHeight: 16 },
  tipStrong: { color: "#5B4B30", fontWeight: "800" },
  guidedCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 13, marginTop: 11, flexDirection: "row", alignItems: "center", gap: 11 },
  guidedIcon: { height: 36, width: 36, borderRadius: 12, backgroundColor: colors.paleBlue, alignItems: "center", justifyContent: "center" },
  guidedTitle: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  guidedMeta: { color: colors.muted, fontSize: 8, letterSpacing: 0.7, marginTop: 5, fontWeight: "700" },
  simulationCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 15 },
  simTitle: { color: colors.ink, fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  simCopy: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 5, marginBottom: 13 },
  simSwitch: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.paleBlue, borderRadius: 11, padding: 11, marginBottom: 8 },
  simSwitchName: { color: "#49617F", fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  portRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F0F2F6" },
  portLed: { width: 8, height: 8, borderRadius: 4 },
  portName: { color: "#55647A", fontSize: 9, fontWeight: "700", flex: 1 },
  vlanChip: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 7 },
  vlanChipText: { fontSize: 8, fontWeight: "800" },
  portRole: { width: 39, color: colors.muted, fontSize: 8 },
  simFeedback: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 13, padding: 10, borderRadius: 10, backgroundColor: "#F1F6FF" },
  simFeedbackText: { flex: 1, color: "#596A82", fontSize: 9, lineHeight: 14 },
  simFieldLabel: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8 },
  sourceChoices: { gap: 8 },
  sourceChoice: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 11, padding: 11 },
  sourceChoiceSelected: { borderColor: "#91B4F8", backgroundColor: "#F4F8FF" },
  sourceChoiceTitle: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  sourceChoiceIp: { color: colors.muted, fontSize: 9, marginTop: 3 },
  aclVerdict: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: 11, marginTop: 13 },
  aclAllow: { backgroundColor: "#EDF8F3" },
  aclDeny: { backgroundColor: "#FFF1F1" },
  aclVerdictTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  aclVerdictCopy: { color: "#657287", fontSize: 9, lineHeight: 14, marginTop: 3 },
  profileHero: { alignItems: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 17, paddingVertical: 21, marginBottom: 12 },
  avatar: { width: 58, height: 58, borderRadius: 22, backgroundColor: colors.paleBlue, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  profileName: { color: colors.ink, fontWeight: "800", fontSize: 15 },
  profileSubtitle: { color: colors.muted, fontSize: 10, marginTop: 4 },
  profileStats: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingVertical: 15, marginBottom: 24 },
  profileStat: { flex: 1, alignItems: "center" },
  profileStatValue: { color: colors.ink, fontSize: 19, fontWeight: "800" },
  profileStatLabel: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.6, marginTop: 4 },
  profileStatDivider: { height: 28, width: 1, backgroundColor: colors.line },
  bestScoreCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 12, marginTop: -13, marginBottom: 23 },
  bestScoreIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: "#FFF4E6", alignItems: "center", justifyContent: "center" },
  bestScoreTitle: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  bestScoreCopy: { color: colors.muted, fontSize: 8, marginTop: 3 },
  bestScoreValue: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  blueprintRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  blueprintDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  blueprintName: { flex: 1, color: "#48566C", fontSize: 11 },
  blueprintWeight: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  profileNote: { flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: colors.paleBlue, borderRadius: 13, padding: 13, marginTop: 19 },
  profileNoteTitle: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  profileNoteCopy: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 4 },
  resetButton: { alignSelf: "center", padding: 12, marginTop: 9 },
  resetText: { color: "#C45461", fontSize: 10, fontWeight: "700" },
  loadingScreen: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  loadingTitle: { color: colors.ink, fontSize: 15, fontWeight: "800", marginTop: 13 },
  loadingCopy: { color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: "center", marginTop: 6 },
  lessonScreen: { flex: 1, backgroundColor: colors.background },
  lessonTopBar: { height: 54, flexDirection: "row", alignItems: "center", paddingHorizontal: 19, gap: 14 },
  lessonBack: { width: 32, height: 32, borderRadius: 11, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  lessonProgressTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: "#E7EBF2", overflow: "hidden" },
  lessonProgressFill: { height: "100%", borderRadius: 3 },
  lessonStep: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  lessonScroll: { paddingHorizontal: 22, paddingTop: 9, paddingBottom: 18 },
  lessonTag: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", borderRadius: 18, paddingHorizontal: 9, paddingVertical: 6, marginBottom: 11 },
  lessonTagDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  lessonTagText: { fontSize: 8, fontWeight: "800", letterSpacing: 0.7 },
  lessonTitle: { color: colors.ink, fontSize: 26, lineHeight: 31, fontWeight: "800", letterSpacing: -0.7 },
  lessonLead: { color: "#637187", fontSize: 12, lineHeight: 19, marginTop: 8 },
  lessonVisual: { marginTop: 17, marginBottom: 12 },
  subnetVisual: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 14 },
  visualCaption: { color: "#8C99AA", fontSize: 8, fontWeight: "800", letterSpacing: 0.8, marginBottom: 12 },
  addressBlocks: { flexDirection: "row", height: 70, borderRadius: 9, overflow: "hidden" },
  networkBlock: { width: "18%", backgroundColor: "#E9A75E", alignItems: "center", justifyContent: "center" },
  hostBlock: { width: "66%", backgroundColor: "#4F89F7", alignItems: "center", justifyContent: "center" },
  broadcastBlock: { width: "16%", backgroundColor: "#D77978", alignItems: "center", justifyContent: "center" },
  blockTop: { color: "#FFFFFF", fontSize: 6, letterSpacing: 0.4, fontWeight: "800" },
  blockBottom: { color: "#FFFFFF", fontSize: 10, fontWeight: "800", marginTop: 4 },
  bitRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  bitLabel: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.6 },
  bitValue: { color: colors.ink, fontSize: 9, fontWeight: "700" },
  genericVisual: { minHeight: 150, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, padding: 15, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  genericVisualIcon: { width: 53, height: 53, borderRadius: 17, backgroundColor: colors.paleBlue, alignItems: "center", justifyContent: "center" },
  genericVisualDivider: { width: 25, height: 2, backgroundColor: "#C9D8F2", marginHorizontal: 12 },
  genericConcepts: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 5 },
  conceptPill: { paddingHorizontal: 7, paddingVertical: 5, backgroundColor: "#F1F5FB", borderRadius: 7 },
  conceptText: { color: "#557092", fontSize: 8, fontWeight: "700" },
  exampleCard: { backgroundColor: "#FFF9F0", borderWidth: 1, borderColor: "#F5EAD8", borderRadius: 14, padding: 13, marginBottom: 12 },
  exampleHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 7 },
  exampleLabel: { color: "#AA782F", fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  exampleText: { color: "#63573F", fontSize: 10, lineHeight: 16 },
  quizCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14 },
  quizEyebrow: { color: colors.blue, fontSize: 8, letterSpacing: 1, fontWeight: "800" },
  quizQuestion: { color: colors.ink, fontSize: 12, lineHeight: 18, fontWeight: "700", marginTop: 6, marginBottom: 10 },
  answerOption: { minHeight: 39, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 10, marginBottom: 6, gap: 9 },
  answerCorrect: { borderColor: "#8FD1B8", backgroundColor: "#F0FAF6" },
  answerIncorrect: { borderColor: "#E9A2A7", backgroundColor: "#FFF5F5" },
  answerRadio: { height: 15, width: 15, borderRadius: 8, borderWidth: 1.5, borderColor: "#C4CBD5", alignItems: "center", justifyContent: "center" },
  answerRadioSelected: { borderColor: colors.green },
  answerRadioDot: { height: 7, width: 7, borderRadius: 4, backgroundColor: colors.green },
  answerText: { flex: 1, color: "#536176", fontSize: 10, fontWeight: "600" },
  answerFeedback: { borderRadius: 9, padding: 10, marginTop: 4 },
  feedbackGood: { backgroundColor: colors.paleGreen },
  feedbackTry: { backgroundColor: "#FFF6E8" },
  feedbackText: { color: "#506557", fontSize: 9, lineHeight: 14 },
  keyIdeaCard: { flexDirection: "row", gap: 9, backgroundColor: colors.paleBlue, borderRadius: 13, padding: 13 },
  keyIdeaLabel: { color: colors.blue, fontSize: 8, letterSpacing: 0.8, fontWeight: "800", marginBottom: 5 },
  keyIdeaText: { color: "#53647D", fontSize: 10, lineHeight: 16 },
  lessonFooter: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 12, backgroundColor: colors.background },
  primaryButton: { height: 48, backgroundColor: colors.blue, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  primaryButtonDisabled: { backgroundColor: "#A8BCE1" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  examScreen: { flex: 1, backgroundColor: colors.background },
  examHeader: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 19, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: "#FFFFFF" },
  examHeaderTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  examHeaderSubtitle: { color: colors.muted, fontSize: 9, marginTop: 3 },
  timerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.paleBlue, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7 },
  timerUrgent: { backgroundColor: "#FFF0F0" },
  timerText: { color: colors.blue, fontSize: 10, fontVariant: ["tabular-nums"], fontWeight: "800" },
  timerTextUrgent: { color: "#C45461" },
  examContent: { paddingHorizontal: 21, paddingTop: 21, paddingBottom: 30 },
  examProgressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 9 },
  examProgressLabel: { color: colors.ink, fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  examAnswered: { color: colors.muted, fontSize: 9 },
  examDomainTag: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 7, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6, marginTop: 23 },
  examDomainText: { color: "#68768B", fontSize: 8, fontWeight: "800", letterSpacing: 0.6 },
  examQuestionTitle: { color: colors.ink, fontSize: 21, lineHeight: 28, fontWeight: "800", letterSpacing: -0.5, marginTop: 14 },
  examHint: { color: colors.muted, fontSize: 10, marginTop: 7, marginBottom: 15 },
  examOption: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, marginBottom: 9 },
  examOptionSelected: { borderColor: "#8EAFF0", backgroundColor: "#F3F7FF" },
  examOptionLetter: { width: 27, height: 27, borderRadius: 9, backgroundColor: "#F1F3F7", alignItems: "center", justifyContent: "center" },
  examOptionLetterSelected: { backgroundColor: colors.blue },
  examOptionLetterText: { color: "#768398", fontSize: 10, fontWeight: "800" },
  examOptionLetterTextSelected: { color: "#FFFFFF" },
  examOptionText: { color: "#536176", fontSize: 10, lineHeight: 15, flex: 1 },
  examOptionTextSelected: { color: colors.ink, fontWeight: "700" },
  examNavigation: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 13 },
  examNavButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 12, paddingRight: 10 },
  examNavDisabled: { opacity: 0.8 },
  examNavText: { color: colors.blue, fontSize: 10, fontWeight: "700" },
  examNavTextDisabled: { color: "#B5BDC9" },
  examNextButton: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.blue, borderRadius: 12, paddingHorizontal: 14 },
  examSubmitButton: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.green, borderRadius: 12, paddingHorizontal: 14 },
  examNextText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  finishEarly: { alignSelf: "center", padding: 12, marginTop: 8 },
  finishEarlyText: { color: colors.muted, fontSize: 9, fontWeight: "700" },
  examResultContent: { paddingHorizontal: 21, paddingTop: 25, paddingBottom: 30 },
  scoreCircle: { width: 118, height: 118, borderRadius: 59, alignSelf: "center", backgroundColor: colors.paleBlue, borderWidth: 7, borderColor: "#D7E4FD", alignItems: "center", justifyContent: "center" },
  scorePercent: { color: colors.blue, fontSize: 27, fontWeight: "900" },
  scoreCaption: { color: "#647A9D", fontSize: 8, letterSpacing: 0.8, fontWeight: "800", marginTop: 1 },
  resultTitle: { color: colors.ink, fontSize: 22, textAlign: "center", fontWeight: "800", marginTop: 15 },
  resultSubtitle: { color: colors.muted, fontSize: 10, textAlign: "center", marginTop: 5 },
  resultTip: { flexDirection: "row", alignItems: "flex-start", gap: 9, backgroundColor: "#FFF8ED", borderRadius: 12, padding: 12, marginTop: 17 },
  resultTipText: { flex: 1, color: "#796849", fontSize: 9, lineHeight: 14 },
  reviewToggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.line },
  reviewToggleText: { color: colors.blue, fontSize: 11, fontWeight: "800" },
  reviewCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, marginTop: 9 },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 7 },
  reviewTopic: { flex: 1, color: colors.ink, fontSize: 9, fontWeight: "800" },
  reviewMark: { fontSize: 7, fontWeight: "900", letterSpacing: 0.5 },
  reviewQuestion: { color: colors.ink, fontSize: 10, lineHeight: 15, fontWeight: "700", marginTop: 9 },
  reviewSelected: { color: "#657287", fontSize: 9, marginTop: 6 },
  reviewAnswer: { color: colors.green, fontSize: 9, fontWeight: "800", marginTop: 7 },
  reviewExplanation: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 5 },
  exitExamButton: { alignSelf: "center", padding: 13 },
  exitExamText: { color: colors.blue, fontSize: 10, fontWeight: "700" },
});
