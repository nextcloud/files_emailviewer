OC.L10N.register(
    "files_emailviewer",
    {
    "Email Viewer" : "電子郵件檢視程式",
    "Enable the php function proc_open to run the email-to-pdf converter." : "啟用 php 函式 proc_open 以執行 email-to-pdf 轉換程式。",
    "Java is required to run the email-to-pdf converter." : "執行 email-to-pdf 轉換程式需要 Java。",
    "Please install https://github.com/nickrussler/email-to-pdf-converter and set the path via `%s`" : "請安裝 https://github.com/nickrussler/email-to-pdf-converter 並透過 `%s` 設定路徑",
    "View .msg and .eml files" : "檢視 .msg 與 .eml 檔案",
    "## Email Viewer integrates the excellent Email to PDF Converter into Nextcloud, enabling you to view .msg and .eml files.\n\n### Requirements\n\n- Nextcloud 28 or newer\n- PDF Viewer for Nextcloud\n- PHP proc_open\n- OpenJDK\n- [wkhtmltopdf](https://wkhtmltopdf.org/)\n- [Email to PDF Converter](https://github.com/nickrussler/email-to-pdf-converter)\n\n### Installation\n\n- Download and enable files_emailviewer\n- Store a copy of the Email to PDF Converter on the server, ensuring that Nextcloud has access to it\n- Set the path to Email to PDF Converter via `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path`\n- Upload a .msg or .eml file and view it directly in Nextcloud 🙌\n\n### Outgoing connections\n\n- If the email contains images from external sources, the Email to PDF converter will download the images, requiring external connections\n- The current version does not consider Nextcloud's proxy configuration but should follow the system default" : "## 電子郵件檢視程式整合了出色的電子郵件轉 PDF 程式至 Nextcloud，讓您可以檢視 .msg 與 .eml 檔案。\n\n### 需求\n\n- Nextcloud 28 或更新版本或更新版本\n- 適用於 Nextcloud 的 PDF 檢視程式\n- PHP proc_open\n- OpenJDK\n- [wkhtmltopdf](https://wkhtmltopdf.org/)\n- [電子郵件轉 PDF 程式](https://github.com/nickrussler/email-to-pdf-converter)\n\n### 安裝\n\n- 下載並啟用 files_emailviewer\n- 在伺服器上儲存電子郵件轉 PDF 程式的副本，並確保 Nextcloud 可以存取該副本\n- 透過 `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path` 設定電子郵件轉 PDF 程式的路徑\n- 上傳 .msg 或 .eml 檔案並直接在 Nextcloud 中檢視 🙌\n\n### 連出連線\n\n- 若電子郵件包含外部來源影像，電子郵件轉 PDF 轉換程式將會下載影像，需要外部連線\n- 目前的版本並未考慮 Nextcloud 的代理伺服器設定，但遵循系統預設值"
},
"nplurals=1; plural=0;");
