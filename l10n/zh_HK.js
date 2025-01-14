OC.L10N.register(
    "files_emailviewer",
    {
    "Email Viewer" : "電郵檢視程式",
    "Enable the php function proc_open to run the email-to-pdf converter." : "啟用 php 函式 proc_open 以執行 email-to-pdf 轉換器。",
    "Java is required to run the email-to-pdf converter." : "執行 email-to-pdf 轉轉換器需要 Java。",
    "Please install https://github.com/nickrussler/email-to-pdf-converter and set the path via `%s`" : "請安裝 https://github.com/nickrussler/email-to-pdf-converter 並透過 `%s` 設定路徑",
    "View .msg and .eml files" : "檢視 .msg 與 .eml 檔案",
    "### Email Viewer integrates the excellent Email to PDF Converter into Nextcloud, enabling you to view .msg and .eml files.\n\n#### Requirements\n\n- Nextcloud 28 or newer\n- PDF Viewer for Nextcloud\n- PHP proc_open\n- OpenJDK\n- [wkhtmltopdf](https://wkhtmltopdf.org/)\n- [Email to PDF Converter](https://github.com/nickrussler/email-to-pdf-converter)\n\n#### Installation\n\n- Download and enable files_emailviewer\n- Store a copy of the Email to PDF Converter on the server, ensuring that Nextcloud has access to it\n- Set the path to Email to PDF Converter via `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path`\n- Upload a .msg or .eml file and view it directly in Nextcloud 🙌\n\n#### Outgoing connections\n\n- If the email contains images from external sources, the Email to PDF converter will download the images, requiring external connections\n- The current version does not consider Nextcloud's proxy configuration but should follow the system default" : "### 電子郵件查看器將優秀的電子郵件轉 PDF 轉換器集成至 Nextcloud，讓您能夠查看 .msg 和 .eml 文件。\n\n#### 系統要求\n\n- Nextcloud 28 或更高版本\n- Nextcloud 的 PDF 查看器\n- PHP proc_open\n- OpenJDK\n- [wkhtmltopdf](https://wkhtmltopdf.org/)\n- [電子郵件轉 PDF 轉換器](https://github.com/nickrussler/email-to-pdf-converter)\n\n#### 安裝步驟\n\n- 下載並啟用 files_emailviewer\n- 將電子郵件轉 PDF 轉換器的副本存儲在伺服器上，確保 Nextcloud 可以訪問它\n- 通過執行 `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path` 設定電子郵件轉 PDF 轉換器的路徑\n- 上傳 .msg 或 .eml 文件，並直接在 Nextcloud 中查看 🙌\n\n#### 外部連接\n\n- 如果電子郵件包含來自外部來源的圖片，電子郵件轉 PDF 轉換器將下載這些圖片，這需要外部連接\n- 目前版本不考慮 Nextcloud 的代理配置，而是遵循系統默認設置"
},
"nplurals=1; plural=0;");
