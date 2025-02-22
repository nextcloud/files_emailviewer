OC.L10N.register(
    "files_emailviewer",
    {
    "Email Viewer" : "Email-Viewer",
    "Enable the php function proc_open to run the email-to-pdf converter." : "Die PHP-Funktion \"proc_open\" aktivieren, um den E-Mail-zu-PDF-Konverter auszuführen.",
    "Java is required to run the email-to-pdf converter." : "Java ist erforderlich, um den E-Mail-zu-PDF-Konverter auszuführen.",
    "Please install https://github.com/nickrussler/email-to-pdf-converter and set the path via `%s`" : "Bitte https://github.com/nickrussler/email-to-pdf-converter installieren und den Pfad über `%s` setzen",
    "View .msg and .eml files" : "Betrachte .msg und .eml Dateien",
    "### Email Viewer integrates the excellent Email to PDF Converter into Nextcloud, enabling you to view .msg and .eml files.\n\n#### Requirements\n\n- Nextcloud 28 or newer\n- Viewer and PDF Viewer for Nextcloud\n- PHP proc_open\n- [Email to PDF Converter](https://github.com/nickrussler/email-to-pdf-converter) (requires OpenJDK and [wkhtmltopdf](https://wkhtmltopdf.org/))\n\n#### Installation\n\n- Download and enable files_emailviewer\n- Store a copy of the Email to PDF Converter on the server, ensuring that Nextcloud has access to it\n- Set the path to Email to PDF Converter via `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path`\n- Upload a .msg or .eml file and view it directly in Nextcloud 🙌\n\n#### Outgoing connections\n\n- If the email contains images from external sources, the Email to PDF converter will download the images, requiring external connections\n- The current version does not consider Nextcloud's proxy configuration but should follow the system default" : "### E-Mail Viewer integriert den hervorragenden E-Mail-zu-PDF-Konverter in Nextcloud und ermöglicht dir das Anzeigen von .msg- und .eml-Dateien.\n\n#### Anforderungen\n\n- Nextcloud 28 oder neuer\n- Viewer und PDF-Viewer für Nextcloud\n- PHP proc_open\n\n\n- [E-Mail-zu-PDF-Konverter](https://github.com/nickrussler/email-to-pdf-converter) (erfordert OpenJDK und [wkhtmltopdf](https://wkhtmltopdf.org/))\n\n#### Installation\n\n- Lade files_emailviewer herunter und aktiviere es\n- Speichere eine Kopie des E-Mail-zu-PDF-Konverters auf dem Server und stelle sicher, dass Nextcloud darauf zugreifen kann\n- Lege den Pfad zum E-Mail-zu-PDF-Konverter über `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path` fest\n- Lade eine .msg- oder .eml-Datei hoch und zeige sie direkt in Nextcloud an 🙌\n\n#### Ausgehende Verbindungen\n\n- Wenn die E-Mail Bilder aus externen Quellen enthält, lädt der E-Mail-zu-PDF-Konverter die Bilder herunter, wofür externe Verbindungen erforderlich sind\n- Die aktuelle Version berücksichtigt die Proxy-Konfiguration von Nextcloud nicht, sollte aber den Systemstandards folgen"
},
"nplurals=2; plural=(n != 1);");
