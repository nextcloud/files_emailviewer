OC.L10N.register(
    "files_emailviewer",
    {
    "Email Viewer" : "이메일 뷰어",
    "Enable the php function proc_open to run the email-to-pdf converter." : "email-to-pdf 변환기를 실행하기 위해서 php 함수 proc_open 을 활성화하십시오.",
    "Java is required to run the email-to-pdf converter." : "email-to-pdf 변환기를 실행하기 위해서 Java가 필요합니다.",
    "Please install https://github.com/nickrussler/email-to-pdf-converter and set the path via `%s`" : "https://github.com/nickrussler/email-to-pdf-converter 를 설치하고 경로를 `%s` 로 설정합니다.",
    "View .msg and .eml files" : ".msg 와 .eml 파일을 표시합니다.",
    "### Email Viewer integrates the excellent Email to PDF Converter into Nextcloud, enabling you to view .msg and .eml files.\n\n#### Requirements\n\n- Nextcloud 28 or newer\n- PDF Viewer for Nextcloud\n- PHP proc_open\n- OpenJDK\n- [wkhtmltopdf](https://wkhtmltopdf.org/)\n- [Email to PDF Converter](https://github.com/nickrussler/email-to-pdf-converter)\n\n#### Installation\n\n- Download and enable files_emailviewer\n- Store a copy of the Email to PDF Converter on the server, ensuring that Nextcloud has access to it\n- Set the path to Email to PDF Converter via `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path`\n- Upload a .msg or .eml file and view it directly in Nextcloud 🙌\n\n#### Outgoing connections\n\n- If the email contains images from external sources, the Email to PDF converter will download the images, requiring external connections\n- The current version does not consider Nextcloud's proxy configuration but should follow the system default" : "### Email Viewer는 완벽한 Email to PDF Converter를 Nextcloud에 통합하여, .msg 및 .eml 파일을 열람할 수 있게 해 줍니다.\n\n#### 요구사항\n\n- Nextcloud 버전 28 이상\n- PDF Viewer for Nextcloud\n- PHP proc_open\n- OpenJDK\n- [wkhtmltopdf](https://wkhtmltopdf.org/)\n- [Email to PDF Converter](https://github.com/nickrussler/email-to-pdf-converter)\n\n#### 설치\n\n- files_emailviewer를 다운로드 후 활성화\n- Email to PDF Converter의 복사본을 서버에 저장하고, Nextcloud가 액세스할 수 있도록 허용\n- `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path` 명령을 통해 Email to PDF Converter의 경로를 설정\n- .msg 또는 .eml 파일을 업로드하고 Nextcloud에서 바로 확인하기 🙌\n\n#### 발신 연결\n\n- 이메일에 외부 소스 이미지가 포함된 경우, Email to PDF Converter가 이미지를 다운로드해야 하므로 외부망과의 연결이 필요합니다.\n- 현재 버전은 Nextcloud의 프록시 설정을 고려하지 않고 시스템 기본값을 따릅니다."
},
"nplurals=1; plural=0;");
