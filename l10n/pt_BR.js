OC.L10N.register(
    "files_emailviewer",
    {
    "Email Viewer" : "Leitor de E-Mail",
    "Enable the php function proc_open to run the email-to-pdf converter." : "Habilite a função php proc_open para executar o conversor email-para-pdf.",
    "Java is required to run the email-to-pdf converter." : "O Java é necessário para executar o conversor email-para-pdf.",
    "Please install https://github.com/nickrussler/email-to-pdf-converter and set the path via `%s`" : "Por favor instale https://github.com/nickrussler/email-to-pdf-converter e configure seu caminho usando `%s`",
    "View .msg and .eml files" : "Ver arquivos .msg e .eml",
    "### Email Viewer integrates the excellent Email to PDF Converter into Nextcloud, enabling you to view .msg and .eml files.\n\n#### Requirements\n\n- Nextcloud 28 or newer\n- Viewer and PDF Viewer for Nextcloud\n- PHP proc_open\n- [Email to PDF Converter](https://github.com/nickrussler/email-to-pdf-converter) (requires OpenJDK and [wkhtmltopdf](https://wkhtmltopdf.org/))\n\n#### Installation\n\n- Download and enable files_emailviewer\n- Store a copy of the Email to PDF Converter on the server, ensuring that Nextcloud has access to it\n- Set the path to Email to PDF Converter via `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path`\n- Upload a .msg or .eml file and view it directly in Nextcloud 🙌\n\n#### Outgoing connections\n\n- If the email contains images from external sources, the Email to PDF converter will download the images, requiring external connections\n- The current version does not consider Nextcloud's proxy configuration but should follow the system default" : "### O Leitor de E-Mail integra o excelente Conversor de E-Mail para PDF ao Nextcloud, permitindo que você visualize arquivos .msg e .eml.\n\n#### Requisitos\n\n- Nextcloud 28 ou mais recente\n- Visualizador e Visualizador de PDF para Nextcloud\n- PHP proc_open\n- [Conversor de E-Mail para PDF](https://github.com/nickrussler/email-to-pdf-converter) (requer OpenJDK e [wkhtmltopdf](https://wkhtmltopdf.org/))\n\n#### Instalação\n\n- Faça download e ative o files_emailviewer\n- Armazene uma cópia do Conversor de E-Mail para PDF no servidor, garantindo que o Nextcloud tenha acesso a ele\n- Defina o caminho para o Conversor de E-Mail para PDF por meio de `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path`\n- Carregue um arquivo .msg ou .eml e visualize-o diretamente no Nextcloud 🙌\n\n#### Conexões de saída\n\n- Se o e-mail contiver imagens de fontes externas, o conversor de e-mail para PDF fará o download das imagens, exigindo conexões externas\n- A versão atual não considera a configuração de proxy do Nextcloud, mas deve seguir o padrão do sistema"
},
"nplurals=3; plural=(n == 0 || n == 1) ? 0 : n != 0 && n % 1000000 == 0 ? 1 : 2;");
