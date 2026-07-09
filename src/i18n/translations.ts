import type { Language } from '../types';

const de = {
  'common.back': 'Zurück',
  'common.close': 'Schließen',
  'common.apply': 'Übernehmen',

  'locate.title': 'Zuerst müssen wir wissen, wo deine Dateien liegen.',
  'locate.openSource': 'Quellverzeichnis öffnen',
  'locate.openTarget': 'Zielverzeichnis öffnen',
  'locate.source': 'Quelle',
  'locate.target': 'Ziel',
  'locate.analyze': 'Dateien analysieren',
  'locate.scanning': 'Durchsuche… {count} Dateien',
  'locate.unsupported':
    'Dein Browser unterstützt die File System Access API nicht. Bitte nutze Chrome, Edge oder Opera.',

  'scenery.describe': 'Beschreibe diese Szene',
  'scenery.placeholder': 'z. B. Strandspaziergang am Morgen',
  'scenery.filesCount': '{count} Dateien',
  'scenery.next': 'Nächste Szene',
  'scenery.continue': 'Weiter',
  'scenery.noMediaTitle': 'Keine Medien gefunden',
  'scenery.noMediaText':
    'Im ausgewählten Quellverzeichnis konnten keine Fotos oder Videos gefunden werden.',
  'scenery.emptyBatch': 'Keine Dateien in diesem Batch.',
  'scenery.prevImage': 'Vorheriges Bild',
  'scenery.nextImage': 'Nächstes Bild',
  'scenery.batchAria': 'Szene {n}',

  'build.title': 'Zeit, die neue Dateistruktur anzulegen',
  'build.namedCount': '{named} von {total} Szenen sind benannt.',
  'build.skipNote': 'Unbenannte Szenen werden übersprungen.',
  'build.back': 'Zurück zu den Szenen',
  'build.start': 'Starten',

  'progress.title': 'Übertrage Dateien…',
  'progress.of': '{done} von {total}',
  'progress.permissionDenied':
    'Schreibrechte für das Zielverzeichnis wurden verweigert.',

  'done.title': 'Fertig!',
  'done.text':
    'Deine Dateien wurden ins Zielverzeichnis sortiert. Du kannst jetzt einen neuen Import starten.',
  'done.restart': 'Neuen Import starten',

  'settings.title': 'Einstellungen',
  'settings.general': 'Allgemein',
  'settings.appearance': 'Darstellung',
  'settings.info': 'Info',
  'settings.language': 'Sprache',
  'settings.batchGap': 'Zeitabstand der Batchgröße',
  'settings.gap1min': '1 Minute',
  'settings.gap10min': '10 Minuten',
  'settings.gap1day': '1 Tag',
  'settings.gapCustom': 'Benutzerdefiniert',
  'settings.minutes': 'Minuten',
  'settings.syntax': 'Syntax für Datum',
  'settings.resetDefault': 'Standard wiederherstellen',
  'settings.staticPlaceholder': 'Statischer Text (z. B. _D)',
  'settings.edit': 'Bearbeiten',
  'settings.done': 'Fertig',
  'settings.remove': 'Entfernen',
  'settings.addDynamic': 'Dynamisches Token hinzufügen',
  'settings.addStatic': 'Statisches Token hinzufügen',
  'settings.theme': 'Erscheinungsbild',
  'settings.themeSystem': 'System',
  'settings.themeLight': 'Hell',
  'settings.themeDark': 'Dunkel',
  'settings.systemNote': 'Folgt automatisch dem Systemstandard ({os}).',

  'info.version': 'Version',
  'info.description':
    'Sortiert Fotos und Videos deiner Kamera automatisch in eine saubere Ordnerstruktur.',
} as const;

export type TranslationKey = keyof typeof de;

type Dict = Record<TranslationKey, string>;

const en: Dict = {
  'common.back': 'Back',
  'common.close': 'Close',
  'common.apply': 'Apply',

  'locate.title': 'First, we need to locate where your files are.',
  'locate.openSource': 'Open Source Directory',
  'locate.openTarget': 'Open Target Directory',
  'locate.source': 'Source',
  'locate.target': 'Target',
  'locate.analyze': 'Analyze files',
  'locate.scanning': 'Scanning… {count} files',
  'locate.unsupported':
    'Your browser does not support the File System Access API. Please use Chrome, Edge or Opera.',

  'scenery.describe': 'Describe this scenery',
  'scenery.placeholder': 'e.g. Morning walk on the beach',
  'scenery.filesCount': '{count} files',
  'scenery.next': 'Next Scenery',
  'scenery.continue': 'Continue',
  'scenery.noMediaTitle': 'No media found',
  'scenery.noMediaText':
    'No photos or videos were found in the selected source directory.',
  'scenery.emptyBatch': 'No files in this batch.',
  'scenery.prevImage': 'Previous image',
  'scenery.nextImage': 'Next image',
  'scenery.batchAria': 'Scene {n}',

  'build.title': 'Time to build the new file structure',
  'build.namedCount': '{named} of {total} scenes are named.',
  'build.skipNote': 'Unnamed scenes will be skipped.',
  'build.back': 'Go back to sceneries',
  'build.start': 'Start',

  'progress.title': 'Transferring files…',
  'progress.of': '{done} of {total}',
  'progress.permissionDenied':
    'Write permission for the target directory was denied.',

  'done.title': 'Done!',
  'done.text':
    'Your files have been sorted into the target directory. You can start a new import now.',
  'done.restart': 'Start new import',

  'settings.title': 'Settings',
  'settings.general': 'General',
  'settings.appearance': 'Appearance',
  'settings.info': 'About',
  'settings.language': 'Language',
  'settings.batchGap': 'Batch time interval',
  'settings.gap1min': '1 minute',
  'settings.gap10min': '10 minutes',
  'settings.gap1day': '1 day',
  'settings.gapCustom': 'Custom',
  'settings.minutes': 'Minutes',
  'settings.syntax': 'Date syntax',
  'settings.resetDefault': 'Restore defaults',
  'settings.staticPlaceholder': 'Static text (e.g. _D)',
  'settings.edit': 'Edit',
  'settings.done': 'Done',
  'settings.remove': 'Remove',
  'settings.addDynamic': 'Add dynamic token',
  'settings.addStatic': 'Add static token',
  'settings.theme': 'Appearance',
  'settings.themeSystem': 'System',
  'settings.themeLight': 'Light',
  'settings.themeDark': 'Dark',
  'settings.systemNote': 'Automatically follows the system setting ({os}).',

  'info.version': 'Version',
  'info.description':
    'Automatically sorts photos and videos from your camera into a clean folder structure.',
};

const it: Dict = {
  'common.back': 'Indietro',
  'common.close': 'Chiudi',
  'common.apply': 'Applica',

  'locate.title': 'Per prima cosa dobbiamo sapere dove si trovano i tuoi file.',
  'locate.openSource': 'Apri cartella di origine',
  'locate.openTarget': 'Apri cartella di destinazione',
  'locate.source': 'Origine',
  'locate.target': 'Destinazione',
  'locate.analyze': 'Analizza file',
  'locate.scanning': 'Scansione… {count} file',
  'locate.unsupported':
    'Il tuo browser non supporta la File System Access API. Usa Chrome, Edge o Opera.',

  'scenery.describe': 'Descrivi questa scena',
  'scenery.placeholder': 'es. Passeggiata mattutina in spiaggia',
  'scenery.filesCount': '{count} file',
  'scenery.next': 'Prossima scena',
  'scenery.continue': 'Continua',
  'scenery.noMediaTitle': 'Nessun file multimediale trovato',
  'scenery.noMediaText':
    'Nella cartella di origine selezionata non sono stati trovati foto o video.',
  'scenery.emptyBatch': 'Nessun file in questo batch.',
  'scenery.prevImage': 'Immagine precedente',
  'scenery.nextImage': 'Immagine successiva',
  'scenery.batchAria': 'Scena {n}',

  'build.title': 'È ora di creare la nuova struttura di cartelle',
  'build.namedCount': '{named} di {total} scene hanno un nome.',
  'build.skipNote': 'Le scene senza nome verranno saltate.',
  'build.back': 'Torna alle scene',
  'build.start': 'Avvia',

  'progress.title': 'Trasferimento file…',
  'progress.of': '{done} di {total}',
  'progress.permissionDenied':
    'Il permesso di scrittura per la cartella di destinazione è stato negato.',

  'done.title': 'Fatto!',
  'done.text':
    'I tuoi file sono stati ordinati nella cartella di destinazione. Ora puoi avviare una nuova importazione.',
  'done.restart': 'Avvia nuova importazione',

  'settings.title': 'Impostazioni',
  'settings.general': 'Generali',
  'settings.appearance': 'Aspetto',
  'settings.info': 'Informazioni',
  'settings.language': 'Lingua',
  'settings.batchGap': 'Intervallo di tempo dei batch',
  'settings.gap1min': '1 minuto',
  'settings.gap10min': '10 minuti',
  'settings.gap1day': '1 giorno',
  'settings.gapCustom': 'Personalizzato',
  'settings.minutes': 'Minuti',
  'settings.syntax': 'Sintassi della data',
  'settings.resetDefault': 'Ripristina predefiniti',
  'settings.staticPlaceholder': 'Testo statico (es. _D)',
  'settings.edit': 'Modifica',
  'settings.done': 'Fine',
  'settings.remove': 'Rimuovi',
  'settings.addDynamic': 'Aggiungi token dinamico',
  'settings.addStatic': 'Aggiungi token statico',
  'settings.theme': 'Aspetto',
  'settings.themeSystem': 'Sistema',
  'settings.themeLight': 'Chiaro',
  'settings.themeDark': 'Scuro',
  'settings.systemNote':
    'Segue automaticamente l’impostazione di sistema ({os}).',

  'info.version': 'Versione',
  'info.description':
    'Ordina automaticamente foto e video della tua fotocamera in una struttura di cartelle pulita.',
};

const fr: Dict = {
  'common.back': 'Retour',
  'common.close': 'Fermer',
  'common.apply': 'Appliquer',

  'locate.title': 'Nous devons d’abord savoir où se trouvent vos fichiers.',
  'locate.openSource': 'Ouvrir le dossier source',
  'locate.openTarget': 'Ouvrir le dossier cible',
  'locate.source': 'Source',
  'locate.target': 'Cible',
  'locate.analyze': 'Analyser les fichiers',
  'locate.scanning': 'Analyse… {count} fichiers',
  'locate.unsupported':
    'Votre navigateur ne prend pas en charge la File System Access API. Utilisez Chrome, Edge ou Opera.',

  'scenery.describe': 'Décrivez cette scène',
  'scenery.placeholder': 'p. ex. Promenade matinale à la plage',
  'scenery.filesCount': '{count} fichiers',
  'scenery.next': 'Scène suivante',
  'scenery.continue': 'Continuer',
  'scenery.noMediaTitle': 'Aucun média trouvé',
  'scenery.noMediaText':
    'Aucune photo ou vidéo n’a été trouvée dans le dossier source sélectionné.',
  'scenery.emptyBatch': 'Aucun fichier dans ce lot.',
  'scenery.prevImage': 'Image précédente',
  'scenery.nextImage': 'Image suivante',
  'scenery.batchAria': 'Scène {n}',

  'build.title': 'Il est temps de créer la nouvelle structure de dossiers',
  'build.namedCount': '{named} scènes sur {total} sont nommées.',
  'build.skipNote': 'Les scènes sans nom seront ignorées.',
  'build.back': 'Retour aux scènes',
  'build.start': 'Démarrer',

  'progress.title': 'Transfert des fichiers…',
  'progress.of': '{done} sur {total}',
  'progress.permissionDenied':
    'L’autorisation d’écriture pour le dossier cible a été refusée.',

  'done.title': 'Terminé !',
  'done.text':
    'Vos fichiers ont été triés dans le dossier cible. Vous pouvez maintenant lancer une nouvelle importation.',
  'done.restart': 'Lancer une nouvelle importation',

  'settings.title': 'Réglages',
  'settings.general': 'Général',
  'settings.appearance': 'Apparence',
  'settings.info': 'Infos',
  'settings.language': 'Langue',
  'settings.batchGap': 'Intervalle de temps des lots',
  'settings.gap1min': '1 minute',
  'settings.gap10min': '10 minutes',
  'settings.gap1day': '1 jour',
  'settings.gapCustom': 'Personnalisé',
  'settings.minutes': 'Minutes',
  'settings.syntax': 'Syntaxe de la date',
  'settings.resetDefault': 'Restaurer les valeurs par défaut',
  'settings.staticPlaceholder': 'Texte statique (p. ex. _D)',
  'settings.edit': 'Modifier',
  'settings.done': 'Terminé',
  'settings.remove': 'Supprimer',
  'settings.addDynamic': 'Ajouter un jeton dynamique',
  'settings.addStatic': 'Ajouter un jeton statique',
  'settings.theme': 'Apparence',
  'settings.themeSystem': 'Système',
  'settings.themeLight': 'Clair',
  'settings.themeDark': 'Sombre',
  'settings.systemNote': 'Suit automatiquement le réglage du système ({os}).',

  'info.version': 'Version',
  'info.description':
    'Trie automatiquement les photos et vidéos de votre caméra dans une structure de dossiers propre.',
};

const es: Dict = {
  'common.back': 'Atrás',
  'common.close': 'Cerrar',
  'common.apply': 'Aplicar',

  'locate.title': 'Primero necesitamos saber dónde están tus archivos.',
  'locate.openSource': 'Abrir carpeta de origen',
  'locate.openTarget': 'Abrir carpeta de destino',
  'locate.source': 'Origen',
  'locate.target': 'Destino',
  'locate.analyze': 'Analizar archivos',
  'locate.scanning': 'Escaneando… {count} archivos',
  'locate.unsupported':
    'Tu navegador no es compatible con la File System Access API. Usa Chrome, Edge u Opera.',

  'scenery.describe': 'Describe esta escena',
  'scenery.placeholder': 'p. ej. Paseo matutino por la playa',
  'scenery.filesCount': '{count} archivos',
  'scenery.next': 'Siguiente escena',
  'scenery.continue': 'Continuar',
  'scenery.noMediaTitle': 'No se encontraron archivos multimedia',
  'scenery.noMediaText':
    'No se encontraron fotos ni vídeos en la carpeta de origen seleccionada.',
  'scenery.emptyBatch': 'No hay archivos en este lote.',
  'scenery.prevImage': 'Imagen anterior',
  'scenery.nextImage': 'Imagen siguiente',
  'scenery.batchAria': 'Escena {n}',

  'build.title': 'Es hora de crear la nueva estructura de carpetas',
  'build.namedCount': '{named} de {total} escenas tienen nombre.',
  'build.skipNote': 'Las escenas sin nombre se omitirán.',
  'build.back': 'Volver a las escenas',
  'build.start': 'Iniciar',

  'progress.title': 'Transfiriendo archivos…',
  'progress.of': '{done} de {total}',
  'progress.permissionDenied':
    'Se denegó el permiso de escritura para la carpeta de destino.',

  'done.title': '¡Listo!',
  'done.text':
    'Tus archivos se han ordenado en la carpeta de destino. Ahora puedes iniciar una nueva importación.',
  'done.restart': 'Iniciar nueva importación',

  'settings.title': 'Ajustes',
  'settings.general': 'General',
  'settings.appearance': 'Apariencia',
  'settings.info': 'Información',
  'settings.language': 'Idioma',
  'settings.batchGap': 'Intervalo de tiempo de los lotes',
  'settings.gap1min': '1 minuto',
  'settings.gap10min': '10 minutos',
  'settings.gap1day': '1 día',
  'settings.gapCustom': 'Personalizado',
  'settings.minutes': 'Minutos',
  'settings.syntax': 'Sintaxis de la fecha',
  'settings.resetDefault': 'Restaurar valores predeterminados',
  'settings.staticPlaceholder': 'Texto estático (p. ej. _D)',
  'settings.edit': 'Editar',
  'settings.done': 'Hecho',
  'settings.remove': 'Eliminar',
  'settings.addDynamic': 'Añadir token dinámico',
  'settings.addStatic': 'Añadir token estático',
  'settings.theme': 'Apariencia',
  'settings.themeSystem': 'Sistema',
  'settings.themeLight': 'Claro',
  'settings.themeDark': 'Oscuro',
  'settings.systemNote': 'Sigue automáticamente el ajuste del sistema ({os}).',

  'info.version': 'Versión',
  'info.description':
    'Ordena automáticamente las fotos y vídeos de tu cámara en una estructura de carpetas limpia.',
};

export const translations: Record<Language, Dict> = { de, en, it, fr, es };
