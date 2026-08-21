import { CleanRule, EmailMessage, CleanHistoryLog } from '../types/index.ts';

export interface RuleMatchResult {
  email: EmailMessage;
  matchedRule: CleanRule;
  reason: string;
}

/**
 * Checks if a specific email matches a clean rule.
 */
export function checkEmailMatch(email: EmailMessage, rule: CleanRule): { matched: boolean; reason?: string; skippedByWhitelist?: boolean } {
  if (!rule.isEnabled) {
    return { matched: false };
  }

  // Only process emails currently in inbox
  if (email.status !== 'inbox') {
    return { matched: false };
  }

  // Account filter
  if (rule.targetAccountIds !== 'all' && !rule.targetAccountIds.includes(email.accountId)) {
    return { matched: false };
  }

  // 1. WHITELIST CHECKS (Safety first)
  if (rule.whitelist) {
    if (rule.whitelist.protectStarred && email.isStarred) {
      return { matched: false, skippedByWhitelist: true, reason: 'Protetta: Email speciale / importante' };
    }

    if (rule.whitelist.protectReceipts && email.isReceipt) {
      return { matched: false, skippedByWhitelist: true, reason: 'Protetta: Ricevuta, fattura o avviso sicurezza' };
    }

    if (rule.whitelist.senders && rule.whitelist.senders.length > 0) {
      const isSenderWhitelisted = rule.whitelist.senders.some(ws => {
        const cleanWs = ws.trim().toLowerCase().replace('*@', '');
        return email.sender.toLowerCase().includes(cleanWs);
      });
      if (isSenderWhitelisted) {
        return { matched: false, skippedByWhitelist: true, reason: 'Protetta: Mittente in Whitelist di sicurezza' };
      }
    }
  }

  // 2. CONDITION CHECKS
  let matchedConditionsCount = 0;
  let activeConditionsCount = 0;

  // Condition A: Older than X days
  if (rule.conditions.olderThanDays !== undefined && rule.conditions.olderThanDays > 0) {
    activeConditionsCount++;
    const emailTime = new Date(email.date).getTime();
    const nowTime = new Date().getTime();
    const daysDiff = (nowTime - emailTime) / (1000 * 60 * 60 * 24);

    if (daysDiff >= rule.conditions.olderThanDays) {
      matchedConditionsCount++;
    } else {
      return { matched: false };
    }
  }

  // Condition B: Senders / Domain filter
  if (rule.conditions.senders && rule.conditions.senders.length > 0) {
    activeConditionsCount++;
    const matchesSender = rule.conditions.senders.some(pattern => {
      const p = pattern.trim().toLowerCase();
      if (p.startsWith('*@')) {
        const domain = p.substring(2);
        return email.sender.toLowerCase().endsWith(domain) || email.sender.toLowerCase().includes(`@${domain}`);
      }
      return email.sender.toLowerCase().includes(p) || email.senderName.toLowerCase().includes(p);
    });

    if (matchesSender) {
      matchedConditionsCount++;
    } else {
      return { matched: false };
    }
  }

  // Condition C: Subject Keywords
  if (rule.conditions.subjectKeywords && rule.conditions.subjectKeywords.length > 0) {
    activeConditionsCount++;
    const sub = email.subject.toLowerCase();
    const matchesKeyword = rule.conditions.subjectKeywords.some(keyword => {
      const kw = keyword.trim().toLowerCase();
      return kw.length > 0 && sub.includes(kw);
    });

    if (matchesKeyword) {
      matchedConditionsCount++;
    } else {
      return { matched: false };
    }
  }

  // Condition D: Unread Only
  if (rule.conditions.unreadOnly) {
    activeConditionsCount++;
    if (!email.isRead) {
      matchedConditionsCount++;
    } else {
      return { matched: false };
    }
  }

  // Condition E: Min Size KB
  if (rule.conditions.minSizeKb && rule.conditions.minSizeKb > 0) {
    activeConditionsCount++;
    if (email.sizeKb >= rule.conditions.minSizeKb) {
      matchedConditionsCount++;
    } else {
      return { matched: false };
    }
  }

  // If no conditions were set at all, don't match everything blindly
  if (activeConditionsCount === 0) {
    return { matched: false };
  }

  return {
    matched: matchedConditionsCount === activeConditionsCount,
    reason: `Corrisponde alla regola "${rule.name}"`
  };
}

/**
 * Evaluates all inbox emails against enabled rules and generates a preview.
 */
export function previewCleaning(
  emails: EmailMessage[],
  rules: CleanRule[]
): {
  matches: RuleMatchResult[];
  totalEmailsToClean: number;
  totalStorageFreedMb: number;
  byRule: { ruleName: string; count: number; storageMb: number }[];
} {
  const enabledRules = rules.filter(r => r.isEnabled);
  const matches: RuleMatchResult[] = [];
  const ruleCounts: Record<string, { count: number; storageMb: number }> = {};

  enabledRules.forEach(r => {
    ruleCounts[r.name] = { count: 0, storageMb: 0 };
  });

  const inboxEmails = emails.filter(e => e.status === 'inbox');

  for (const email of inboxEmails) {
    for (const rule of enabledRules) {
      const check = checkEmailMatch(email, rule);
      if (check.matched) {
        matches.push({
          email,
          matchedRule: rule,
          reason: check.reason || `Regola: ${rule.name}`
        });

        if (ruleCounts[rule.name]) {
          ruleCounts[rule.name].count += 1;
          ruleCounts[rule.name].storageMb += (email.sizeKb / 1024);
        }
        break; // Stop at first matched rule for this email
      }
    }
  }

  const totalStorageFreedMb = matches.reduce((acc, curr) => acc + (curr.email.sizeKb / 1024), 0);

  const byRule = Object.entries(ruleCounts)
    .filter(([_, data]) => data.count > 0)
    .map(([ruleName, data]) => ({
      ruleName,
      count: data.count,
      storageMb: Math.round(data.storageMb * 100) / 100
    }));

  return {
    matches,
    totalEmailsToClean: matches.length,
    totalStorageFreedMb: Math.round(totalStorageFreedMb * 100) / 100,
    byRule
  };
}

/**
 * Executes the cleaning process based on matched rules.
 */
export function executeCleanRun(
  emails: EmailMessage[],
  rules: CleanRule[],
  isDailyAutoRun: boolean = false
): {
  updatedEmails: EmailMessage[];
  updatedRules: CleanRule[];
  log: CleanHistoryLog;
  cleanedCount: number;
  freedMb: number;
} {
  const preview = previewCleaning(emails, rules);
  const matchedMap = new Map<string, CleanRule>();

  preview.matches.forEach(m => {
    matchedMap.set(m.email.id, m.matchedRule);
  });

  const nowIso = new Date().toISOString();
  const ruleStatUpdates: Record<string, { count: number; freedMb: number }> = {};

  const updatedEmails = emails.map(email => {
    const matchedRule = matchedMap.get(email.id);
    if (!matchedRule) return email;

    const action = matchedRule.action || 'trash';
    const freedMb = email.sizeKb / 1024;

    if (!ruleStatUpdates[matchedRule.id]) {
      ruleStatUpdates[matchedRule.id] = { count: 0, freedMb: 0 };
    }
    ruleStatUpdates[matchedRule.id].count += 1;
    ruleStatUpdates[matchedRule.id].freedMb += freedMb;

    if (action === 'trash') {
      return {
        ...email,
        status: 'trashed' as const,
        trashedAt: nowIso,
        matchedRuleId: matchedRule.id,
        matchedRuleName: matchedRule.name
      };
    } else {
      return {
        ...email,
        status: 'deleted' as const,
        matchedRuleId: matchedRule.id,
        matchedRuleName: matchedRule.name
      };
    }
  });

  const updatedRules = rules.map(rule => {
    const stats = ruleStatUpdates[rule.id];
    if (!stats) return rule;

    return {
      ...rule,
      lastAppliedAt: 'Proprio adesso',
      stats: {
        emailsMatched: rule.stats.emailsMatched + stats.count,
        storageFreedMb: Math.round((rule.stats.storageFreedMb + stats.freedMb) * 100) / 100
      }
    };
  });

  const log: CleanHistoryLog = {
    id: `log-${Date.now()}`,
    timestamp: nowIso,
    accountIds: ['all'],
    emailsCleaned: preview.totalEmailsToClean,
    storageFreedMb: preview.totalStorageFreedMb,
    action: 'trash',
    ruleBreakdown: preview.byRule.map(b => ({ ruleName: b.ruleName, count: b.count })),
    isDailyAutoRun,
    executionDurationMs: 1400
  };

  return {
    updatedEmails,
    updatedRules,
    log,
    cleanedCount: preview.totalEmailsToClean,
    freedMb: preview.totalStorageFreedMb
  };
}

/**
 * Executes a dedicated manual clean on demand (supports preset quick filters or specific accounts).
 */
export function executeManualQuickClean(
  emails: EmailMessage[],
  rules: CleanRule[],
  cleanType: 'all' | 'promotions' | 'old' | 'account' = 'all',
  targetAccountId?: string
): {
  updatedEmails: EmailMessage[];
  updatedRules: CleanRule[];
  log: CleanHistoryLog;
  cleanedCount: number;
  freedMb: number;
} {
  // If we have active rules and type is 'all', run standard
  const activeRules = rules.filter(r => r.isEnabled);

  let effectiveRules = activeRules;

  if (cleanType === 'promotions') {
    effectiveRules = [{
      id: 'quick-promo',
      name: 'Pulizia Promozioni & Newsletter',
      isEnabled: true,
      targetAccountIds: targetAccountId ? [targetAccountId] : 'all',
      conditions: {
        senders: ['*@newsletter.*', '*@promo.*', 'news@*', 'offerte@*', '*@marketing.*'],
        subjectKeywords: ['sconto', 'offerta', 'saldi', 'promo', 'coupon', 'newsletter']
      },
      action: 'trash',
      whitelist: { senders: [], protectStarred: true, protectReceipts: true },
      createdAt: new Date().toISOString(),
      stats: { emailsMatched: 0, storageFreedMb: 0 }
    }];
  } else if (cleanType === 'old') {
    effectiveRules = [{
      id: 'quick-old',
      name: 'Pulizia Posta Vecchia (> 30 gg)',
      isEnabled: true,
      targetAccountIds: targetAccountId ? [targetAccountId] : 'all',
      conditions: { olderThanDays: 30 },
      action: 'trash',
      whitelist: { senders: [], protectStarred: true, protectReceipts: true },
      createdAt: new Date().toISOString(),
      stats: { emailsMatched: 0, storageFreedMb: 0 }
    }];
  } else if (targetAccountId) {
    effectiveRules = activeRules.map(r => ({
      ...r,
      targetAccountIds: [targetAccountId]
    }));
  } else if (effectiveRules.length === 0) {
    // Default safe fallback rule if user clicks clean with 0 rules
    effectiveRules = [{
      id: 'default-safe-clean',
      name: 'Pulizia Sicura Spam & Promozioni',
      isEnabled: true,
      targetAccountIds: 'all',
      conditions: {
        senders: ['*@newsletter.*', '*@promo.*', 'news@*', 'offerte@*'],
        subjectKeywords: ['sconto', 'offerta', 'saldi', 'newsletter']
      },
      action: 'trash',
      whitelist: { senders: [], protectStarred: true, protectReceipts: true },
      createdAt: new Date().toISOString(),
      stats: { emailsMatched: 0, storageFreedMb: 0 }
    }];
  }

  return executeCleanRun(emails, effectiveRules, false);
}

