OC.L10N.register(
    "files_emailviewer",
    {
    "Email Viewer" : "Amharcóir Ríomhphoist",
    "Enable the php function proc_open to run the email-to-pdf converter." : "Cumasaigh an fheidhm php proc_open chun an tiontaire ríomhphost-go-pdf a rith.",
    "Java is required to run the email-to-pdf converter." : "Tá gá le Java chun an tiontaire ríomhphost go pdf a rith.",
    "Please install https://github.com/nickrussler/email-to-pdf-converter and set the path via `%s`" : "Suiteáil https://github.com/nickrussler/email-to-pdf-converter agus socraigh an chonair trí `%s`",
    "View .msg and .eml files" : "Féach ar chomhaid .msg agus .eml",
    "### Email Viewer integrates the excellent Email to PDF Converter into Nextcloud, enabling you to view .msg and .eml files.\n\n#### Requirements\n\n- Nextcloud 28 or newer\n- Viewer and PDF Viewer for Nextcloud\n- PHP proc_open\n- [Email to PDF Converter](https://github.com/nickrussler/email-to-pdf-converter) (requires OpenJDK and [wkhtmltopdf](https://wkhtmltopdf.org/))\n\n#### Installation\n\n- Download and enable files_emailviewer\n- Store a copy of the Email to PDF Converter on the server, ensuring that Nextcloud has access to it\n- Set the path to Email to PDF Converter via `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path`\n- Upload a .msg or .eml file and view it directly in Nextcloud 🙌\n\n#### Outgoing connections\n\n- If the email contains images from external sources, the Email to PDF converter will download the images, requiring external connections\n- The current version does not consider Nextcloud's proxy configuration but should follow the system default" : "Comhtháthaíonn ### Amharcóir Ríomhphoist an Tiontaire Ríomhphost go PDF den scoth isteach i Nextcloud, rud a chuirfidh ar do chumas comhaid .msg agus .eml a fheiceáil.\n\n#### Riachtanais\n\n- Nextcloud 28 nó níos nuaí\n- Amharcóir agus Amharcóir PDF le haghaidh Nextcloud\n- PHP proc_open\n- [Ríomhphost go PDF Tiontaire](https://github.com/nickrussler/email-to-pdf-converter) (gá OpenJDK agus [wkhtmltopdf](https://wkhtmltopdf.org/))\n\n#### Suiteáil\n\n- Íoslódáil agus cumasaigh comhaid_emailviewer\n- Stóráil cóip den Tiontaire Ríomhphost go PDF ar an bhfreastalaí, ag cinntiú go bhfuil rochtain ag Nextcloud air\n- Socraigh an cosán chuig Ríomhphost go Tiontaire PDF trí `occ config: app: set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path`\n- Uaslódáil comhad .msg nó .eml agus féach air go díreach in Nextcloud 🙌\n\n#### naisc amach\n\n- Má tá íomhánna ó fhoinsí seachtracha sa ríomhphost, íoslódálann an tiontaire Ríomhphost go PDF na híomhánna, agus beidh naisc sheachtracha ag teastáil uathu\n- Ní mheasann an leagan reatha cumraíocht seachfhreastalaí Nextcloud ach ba cheart go leanfadh sé réamhshocrú an chórais"
},
"nplurals=5; plural=(n==1 ? 0 : n==2 ? 1 : n<7 ? 2 : n<11 ? 3 : 4);");
