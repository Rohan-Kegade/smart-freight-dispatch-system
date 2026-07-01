export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'pt';

export const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'zh', label: 'Chinese (Simplified)', native: '中文（简体）' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
];

export interface Dictionary {
  nav: {
    dispatch: string;
    bookings: string;
    assistant: string;
    overview: string;
    fleet: string;
    drivers: string;
    knowledgeBase: string;
    calendar: string;
    leave: string;
    users: string;
    auditLogs: string;
  };
  sidebar: {
    settings: string;
    logout: string;
    workspace: string;
    dispatcherRole: string;
    adminRole: string;
    systemAdminRole: string;
  };
  settingsNav: {
    heading: string;
    account: string;
    organisation: string;
    billing: string;
    notifications: string;
    language: string;
  };
  /** Keyed by route pathname, same set of keys across all languages. */
  pages: Record<string, [string, string]>;
  special: {
    bookingDetail: string;
    matchResults: [string, string];
  };
}

const pageKeys = [
  '/app/dashboard',
  '/app/request/new',
  '/app/bookings',
  '/app/assistant',
  '/app/fleet/dashboard',
  '/app/fleet/vehicles',
  '/app/fleet/drivers',
  '/app/fleet/documents',
  '/app/fleet/calendar',
  '/app/fleet/leave',
  '/app/system/users',
  '/app/system/audit-logs',
  '/app/settings/account',
  '/app/settings/org',
  '/app/settings/billing',
  '/app/settings/notifications',
  '/app/settings/language',
  '/app/notifications',
] as const;

function buildPages(values: Record<(typeof pageKeys)[number], [string, string]>): Record<string, [string, string]> {
  return values;
}

export const dictionaries: Record<Language, Dictionary> = {
  en: {
    nav: {
      dispatch: 'Dispatch',
      bookings: 'Bookings',
      assistant: 'Assistant',
      overview: 'Overview',
      fleet: 'Fleet',
      drivers: 'Drivers',
      knowledgeBase: 'Knowledge base',
      calendar: 'Calendar',
      leave: 'Leave',
      users: 'Users',
      auditLogs: 'Audit logs',
    },
    sidebar: {
      settings: 'Settings',
      logout: 'Log out',
      workspace: 'workspace',
      dispatcherRole: 'Dispatcher',
      adminRole: 'Fleet Manager',
      systemAdminRole: 'System Admin',
    },
    settingsNav: {
      heading: 'Settings',
      account: 'Account',
      organisation: 'Organisation',
      billing: 'Billing',
      notifications: 'Notifications',
      language: 'Language',
    },
    pages: buildPages({
      '/app/dashboard': ['Dispatch', 'Capture a request and confirm the best match'],
      '/app/request/new': ['New Request', 'Describe a shipment in plain language'],
      '/app/bookings': ['Bookings', 'All scheduled and ad-hoc jobs'],
      '/app/assistant': ['Knowledge Assistant', 'Grounded answers from your policy documents'],
      '/app/fleet/dashboard': ['Overview', 'Fleet at a glance'],
      '/app/fleet/vehicles': ['Fleet', 'Vehicles — the source of truth'],
      '/app/fleet/drivers': ['Drivers', 'Roster, licences and working hours'],
      '/app/fleet/documents': ['Knowledge Base', 'Documents powering the assistant'],
      '/app/fleet/calendar': ['Calendar', 'Fleet allocations, maintenance and driver schedules'],
      '/app/fleet/leave': ['Leave requests', 'Review and approve driver time-off'],
      '/app/system/users': ['Users', 'Provision and manage every account'],
      '/app/system/audit-logs': ['Audit logs', 'Immutable record of system activity'],
      '/app/settings/account': ['Account', 'Your profile and preferences'],
      '/app/settings/org': ['Organisation', 'Workspace settings'],
      '/app/settings/billing': ['Billing', 'Plan and payment'],
      '/app/settings/notifications': ['Notifications', 'Choose which events you want to be notified about'],
      '/app/settings/language': ['Language', 'Choose the app language'],
      '/app/notifications': ['Notifications', ''],
    }),
    special: {
      bookingDetail: 'Booking detail',
      matchResults: ['Match results', 'Ranked vehicle + driver pairs'],
    },
  },
  es: {
    nav: {
      dispatch: 'Despacho',
      bookings: 'Reservas',
      assistant: 'Asistente',
      overview: 'Resumen',
      fleet: 'Flota',
      drivers: 'Conductores',
      knowledgeBase: 'Base de conocimiento',
      calendar: 'Calendario',
      leave: 'Permisos',
      users: 'Usuarios',
      auditLogs: 'Auditoría',
    },
    sidebar: {
      settings: 'Configuración',
      logout: 'Cerrar sesión',
      workspace: 'espacio de trabajo',
      dispatcherRole: 'Despachador',
      adminRole: 'Gerente de flota',
      systemAdminRole: 'Administrador del sistema',
    },
    settingsNav: {
      heading: 'Configuración',
      account: 'Cuenta',
      organisation: 'Organización',
      billing: 'Facturación',
      notifications: 'Notificaciones',
      language: 'Idioma',
    },
    pages: buildPages({
      '/app/dashboard': ['Despacho', 'Captura una solicitud y confirma la mejor coincidencia'],
      '/app/request/new': ['Nueva solicitud', 'Describe un envío en lenguaje sencillo'],
      '/app/bookings': ['Reservas', 'Todos los trabajos programados y puntuales'],
      '/app/assistant': ['Asistente de conocimiento', 'Respuestas fundamentadas en tus documentos de políticas'],
      '/app/fleet/dashboard': ['Resumen', 'La flota de un vistazo'],
      '/app/fleet/vehicles': ['Flota', 'Vehículos — la fuente de la verdad'],
      '/app/fleet/drivers': ['Conductores', 'Plantilla, licencias y horas de trabajo'],
      '/app/fleet/documents': ['Base de conocimiento', 'Documentos que alimentan al asistente'],
      '/app/fleet/calendar': ['Calendario', 'Asignaciones de flota, mantenimiento y horarios de conductores'],
      '/app/fleet/leave': ['Solicitudes de permiso', 'Revisar y aprobar las ausencias de los conductores'],
      '/app/system/users': ['Usuarios', 'Aprovisiona y administra todas las cuentas'],
      '/app/system/audit-logs': ['Registros de auditoría', 'Registro inmutable de la actividad del sistema'],
      '/app/settings/account': ['Cuenta', 'Tu perfil y preferencias'],
      '/app/settings/org': ['Organización', 'Configuración del espacio de trabajo'],
      '/app/settings/billing': ['Facturación', 'Plan y pago'],
      '/app/settings/notifications': ['Notificaciones', 'Elige qué eventos quieres que se te notifiquen'],
      '/app/settings/language': ['Idioma', 'Elige el idioma de la aplicación'],
      '/app/notifications': ['Notificaciones', ''],
    }),
    special: {
      bookingDetail: 'Detalle de la reserva',
      matchResults: ['Resultados de coincidencia', 'Pares de vehículo y conductor clasificados'],
    },
  },
  fr: {
    nav: {
      dispatch: 'Répartition',
      bookings: 'Réservations',
      assistant: 'Assistant',
      overview: 'Aperçu',
      fleet: 'Flotte',
      drivers: 'Chauffeurs',
      knowledgeBase: 'Base de connaissances',
      calendar: 'Calendrier',
      leave: 'Congés',
      users: 'Utilisateurs',
      auditLogs: "Journal d'audit",
    },
    sidebar: {
      settings: 'Paramètres',
      logout: 'Déconnexion',
      workspace: 'espace de travail',
      dispatcherRole: 'Répartiteur',
      adminRole: 'Gestionnaire de flotte',
      systemAdminRole: 'Administrateur système',
    },
    settingsNav: {
      heading: 'Paramètres',
      account: 'Compte',
      organisation: 'Organisation',
      billing: 'Facturation',
      notifications: 'Notifications',
      language: 'Langue',
    },
    pages: buildPages({
      '/app/dashboard': ['Répartition', 'Saisissez une demande et confirmez la meilleure correspondance'],
      '/app/request/new': ['Nouvelle demande', 'Décrivez un envoi en langage simple'],
      '/app/bookings': ['Réservations', 'Toutes les missions planifiées et ponctuelles'],
      '/app/assistant': ['Assistant de connaissances', 'Réponses fondées sur vos documents de politique'],
      '/app/fleet/dashboard': ['Aperçu', "La flotte en un coup d'œil"],
      '/app/fleet/vehicles': ['Flotte', 'Véhicules — la source de vérité'],
      '/app/fleet/drivers': ['Chauffeurs', 'Effectif, permis et heures de travail'],
      '/app/fleet/documents': ['Base de connaissances', "Documents alimentant l'assistant"],
      '/app/fleet/calendar': ['Calendrier', 'Allocations de flotte, maintenance et horaires des chauffeurs'],
      '/app/fleet/leave': ['Demandes de congé', 'Examiner et approuver les congés des chauffeurs'],
      '/app/system/users': ['Utilisateurs', 'Provisionnez et gérez tous les comptes'],
      '/app/system/audit-logs': ["Journaux d'audit", "Registre immuable de l'activité du système"],
      '/app/settings/account': ['Compte', 'Votre profil et préférences'],
      '/app/settings/org': ['Organisation', "Paramètres de l'espace de travail"],
      '/app/settings/billing': ['Facturation', 'Forfait et paiement'],
      '/app/settings/notifications': ['Notifications', 'Choisissez les événements à notifier'],
      '/app/settings/language': ['Langue', "Choisissez la langue de l'application"],
      '/app/notifications': ['Notifications', ''],
    }),
    special: {
      bookingDetail: 'Détail de la réservation',
      matchResults: ['Résultats de correspondance', 'Paires véhicule + chauffeur classées'],
    },
  },
  de: {
    nav: {
      dispatch: 'Disposition',
      bookings: 'Buchungen',
      assistant: 'Assistent',
      overview: 'Übersicht',
      fleet: 'Flotte',
      drivers: 'Fahrer',
      knowledgeBase: 'Wissensdatenbank',
      calendar: 'Kalender',
      leave: 'Urlaub',
      users: 'Benutzer',
      auditLogs: 'Audit-Log',
    },
    sidebar: {
      settings: 'Einstellungen',
      logout: 'Abmelden',
      workspace: 'Arbeitsbereich',
      dispatcherRole: 'Disponent',
      adminRole: 'Flottenmanager',
      systemAdminRole: 'Systemadministrator',
    },
    settingsNav: {
      heading: 'Einstellungen',
      account: 'Konto',
      organisation: 'Organisation',
      billing: 'Abrechnung',
      notifications: 'Benachrichtigungen',
      language: 'Sprache',
    },
    pages: buildPages({
      '/app/dashboard': ['Disposition', 'Erfassen Sie eine Anfrage und bestätigen Sie die beste Übereinstimmung'],
      '/app/request/new': ['Neue Anfrage', 'Beschreiben Sie eine Sendung in einfacher Sprache'],
      '/app/bookings': ['Buchungen', 'Alle geplanten und Ad-hoc-Aufträge'],
      '/app/assistant': ['Wissensassistent', 'Fundierte Antworten aus Ihren Richtliniendokumenten'],
      '/app/fleet/dashboard': ['Übersicht', 'Die Flotte auf einen Blick'],
      '/app/fleet/vehicles': ['Flotte', 'Fahrzeuge — die maßgebliche Quelle'],
      '/app/fleet/drivers': ['Fahrer', 'Personal, Führerscheine und Arbeitszeiten'],
      '/app/fleet/documents': ['Wissensdatenbank', 'Dokumente für den Assistenten'],
      '/app/fleet/calendar': ['Kalender', 'Flottenzuteilungen, Wartung und Fahrerpläne'],
      '/app/fleet/leave': ['Urlaubsanträge', 'Urlaubsanträge der Fahrer prüfen und genehmigen'],
      '/app/system/users': ['Benutzer', 'Alle Konten bereitstellen und verwalten'],
      '/app/system/audit-logs': ['Prüfprotokolle', 'Unveränderliches Protokoll der Systemaktivität'],
      '/app/settings/account': ['Konto', 'Ihr Profil und Ihre Einstellungen'],
      '/app/settings/org': ['Organisation', 'Einstellungen des Arbeitsbereichs'],
      '/app/settings/billing': ['Abrechnung', 'Plan und Zahlung'],
      '/app/settings/notifications': ['Benachrichtigungen', 'Wählen Sie, über welche Ereignisse Sie benachrichtigt werden möchten'],
      '/app/settings/language': ['Sprache', 'Wählen Sie die Sprache der Anwendung'],
      '/app/notifications': ['Benachrichtigungen', ''],
    }),
    special: {
      bookingDetail: 'Buchungsdetails',
      matchResults: ['Übereinstimmungsergebnisse', 'Eingestufte Fahrzeug- und Fahrerpaare'],
    },
  },
  zh: {
    nav: {
      dispatch: '调度',
      bookings: '预订',
      assistant: '助手',
      overview: '概览',
      fleet: '车队',
      drivers: '司机',
      knowledgeBase: '知识库',
      calendar: '日历',
      leave: '请假',
      users: '用户',
      auditLogs: '审计日志',
    },
    sidebar: {
      settings: '设置',
      logout: '退出登录',
      workspace: '工作区',
      dispatcherRole: '调度员',
      adminRole: '车队经理',
      systemAdminRole: '系统管理员',
    },
    settingsNav: {
      heading: '设置',
      account: '账户',
      organisation: '组织',
      billing: '账单',
      notifications: '通知',
      language: '语言',
    },
    pages: buildPages({
      '/app/dashboard': ['调度', '接收请求并确认最佳匹配'],
      '/app/request/new': ['新请求', '用简单语言描述货物运输'],
      '/app/bookings': ['预订', '所有已安排和临时的任务'],
      '/app/assistant': ['知识助手', '基于您的政策文件提供有依据的答案'],
      '/app/fleet/dashboard': ['概览', '车队一览'],
      '/app/fleet/vehicles': ['车队', '车辆——真实数据来源'],
      '/app/fleet/drivers': ['司机', '名册、执照和工作时长'],
      '/app/fleet/documents': ['知识库', '为助手提供支持的文档'],
      '/app/fleet/calendar': ['日历', '车队分配、维护和司机排班'],
      '/app/fleet/leave': ['请假申请', '审核并批准司机的请假'],
      '/app/system/users': ['用户', '配置和管理所有账户'],
      '/app/system/audit-logs': ['审计日志', '系统活动的不可变记录'],
      '/app/settings/account': ['账户', '您的个人资料和偏好设置'],
      '/app/settings/org': ['组织', '工作区设置'],
      '/app/settings/billing': ['账单', '套餐与付款'],
      '/app/settings/notifications': ['通知', '选择您想要接收通知的事件'],
      '/app/settings/language': ['语言', '选择应用程序语言'],
      '/app/notifications': ['通知', ''],
    }),
    special: {
      bookingDetail: '预订详情',
      matchResults: ['匹配结果', '排名的车辆+司机组合'],
    },
  },
  pt: {
    nav: {
      dispatch: 'Despacho',
      bookings: 'Reservas',
      assistant: 'Assistente',
      overview: 'Visão geral',
      fleet: 'Frota',
      drivers: 'Motoristas',
      knowledgeBase: 'Base de conhecimento',
      calendar: 'Calendário',
      leave: 'Licenças',
      users: 'Usuários',
      auditLogs: 'Auditoria',
    },
    sidebar: {
      settings: 'Configurações',
      logout: 'Sair',
      workspace: 'espaço de trabalho',
      dispatcherRole: 'Despachante',
      adminRole: 'Gerente de frota',
      systemAdminRole: 'Administrador do sistema',
    },
    settingsNav: {
      heading: 'Configurações',
      account: 'Conta',
      organisation: 'Organização',
      billing: 'Faturamento',
      notifications: 'Notificações',
      language: 'Idioma',
    },
    pages: buildPages({
      '/app/dashboard': ['Despacho', 'Capture uma solicitação e confirme a melhor correspondência'],
      '/app/request/new': ['Nova solicitação', 'Descreva um envio em linguagem simples'],
      '/app/bookings': ['Reservas', 'Todos os trabalhos agendados e avulsos'],
      '/app/assistant': ['Assistente de conhecimento', 'Respostas fundamentadas em seus documentos de política'],
      '/app/fleet/dashboard': ['Visão geral', 'A frota em um relance'],
      '/app/fleet/vehicles': ['Frota', 'Veículos — a fonte da verdade'],
      '/app/fleet/drivers': ['Motoristas', 'Equipe, licenças e horas de trabalho'],
      '/app/fleet/documents': ['Base de conhecimento', 'Documentos que alimentam o assistente'],
      '/app/fleet/calendar': ['Calendário', 'Alocações de frota, manutenção e horários dos motoristas'],
      '/app/fleet/leave': ['Solicitações de licença', 'Revisar e aprovar as folgas dos motoristas'],
      '/app/system/users': ['Usuários', 'Provisione e gerencie todas as contas'],
      '/app/system/audit-logs': ['Logs de auditoria', 'Registro imutável da atividade do sistema'],
      '/app/settings/account': ['Conta', 'Seu perfil e preferências'],
      '/app/settings/org': ['Organização', 'Configurações do espaço de trabalho'],
      '/app/settings/billing': ['Faturamento', 'Plano e pagamento'],
      '/app/settings/notifications': ['Notificações', 'Escolha quais eventos deseja ser notificado'],
      '/app/settings/language': ['Idioma', 'Escolha o idioma do aplicativo'],
      '/app/notifications': ['Notificações', ''],
    }),
    special: {
      bookingDetail: 'Detalhes da reserva',
      matchResults: ['Resultados de correspondência', 'Pares classificados de veículo + motorista'],
    },
  },
};
