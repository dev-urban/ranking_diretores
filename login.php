<?php
session_start();

// Ativar exibição de erros para depuração (remova em produção)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurações de conexão com o banco de dados
$servername = "autorack.proxy.rlwy.net";
$username = "root";
$password = "GNHDHOypGqUawjznxelXjDkDTngLZDts"; // Substitua pela sua senha real
$dbname = "railway";
$port = 50275;

// Conecta ao banco de dados usando MySQLi
$conn = new mysqli($servername, $username, $password, $dbname, $port);

// Verifica a conexão
if ($conn->connect_error) {
    die("Erro na conexão com o banco de dados: " . $conn->connect_error);
}

// Inicializa variáveis de erro
$error = '';

// Verifica se o formulário de login foi enviado
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $senha = $_POST['senha'];

    // Prepara a consulta
    $stmt = $conn->prepare("SELECT id, username, password, role_id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    // Verifica se o usuário existe
    if ($stmt->num_rows === 1) {
        $stmt->bind_result($user_id, $username, $hashed_password, $role_id);
        $stmt->fetch();

        // Verifica a senha
        if (password_verify($senha, $hashed_password)) {
            // Senha correta, inicia a sessão
            $_SESSION['loggedin'] = true;
            $_SESSION['id_usuario'] = $user_id;
            $_SESSION['username'] = $username;
            $_SESSION['role_id'] = $role_id;

            // Obter o nome do papel (role) a partir da tabela roles
            $stmt_role = $conn->prepare("SELECT name FROM roles WHERE id = ?");
            $stmt_role->bind_param("i", $role_id);
            $stmt_role->execute();
            $stmt_role->bind_result($role_name);
            $stmt_role->fetch();
            $_SESSION['tipo_operador'] = $role_name;
            $stmt_role->close();

            // Regenera o ID da sessão para segurança
            session_regenerate_id(true);

            // Redireciona com base no tipo de operador
            if ($username == "Edio Ferreira" && $role_name == "Marketing") {
                header("Location: dev.php");
                exit;
            } elseif ($role_name == "Marketing") {
                header("Location: admin_marketing.php");
                exit;
            } elseif ($role_name == "Diretor") {
                header("Location: admin_diretor.php");
                exit;
            } elseif ($role_name == "Gerente") {
                header("Location: admin_gerente.php");
                exit;
            } else {
                echo "Acesso não permitido para este usuário.";
            }
        } else {
            // Senha incorreta
            $error = "Senha incorreta.";
        }
    } else {
        // Usuário não encontrado
        $error = "Email não encontrado.";
    }

    $stmt->close();
}

// Fecha a conexão
$conn->close();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistema de Roleta</title>
    <style>
        /* Reset básico */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #000; /* Definir cor das fontes para preto */
        }

        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
            position: relative;
        }

        h1 {
            margin-bottom: 20px;
            font-size: 24px;
            color: #000; /* Garantir que o título esteja preto */
        }

        form {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .form-group {
            width: 100%;
            margin-bottom: 15px;
            text-align: left;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #000; /* Garantir que os labels estejam pretos */
        }

        input, button {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
            color: #000; /* Garantir que os inputs tenham texto preto */
        }

        button {
            background-color: #ed741d; /* Laranja */
            color: white;
            border: none;
            cursor: pointer;
            align-self: center;
            transition: background-color 0.3s ease;
        }

        button:hover {
            background-color: #c5c3c1; /* Cinza Claro */
        }

        .error-message {
            color: red;
            margin-top: 20px; /* Posiciona a mensagem de erro um pouco mais abaixo */
            text-align: center; /* Centraliza a mensagem de erro */
        }

        .footer {
            margin-top: 20px;
        }

        .footer img {
            width: 160px;
            height: 84px;
        }

        /* Tela de Carregamento */
        .loading-screen {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .loading-screen.active {
            display: flex;
        }

        .loading-spinner {
            border: 8px solid #f3f3f3;
            border-top: 8px solid orange;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        $(document).ready(function(){
            // Mostrar tela de carregamento ao submeter o formulário
            $('#loginForm').on('submit', function(){
                $('.loading-screen').addClass('active');
            });
        });
    </script>
</head>
<body>
    <!-- Tela de Carregamento -->
    <div class="loading-screen" id="loadingScreen">
        <div class="loading-spinner"></div>
    </div>

    <div class="container">
        <h1>Sistema de Roleta</h1>
        <form id="loginForm" method="POST" action="login.php">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" placeholder="Digite seu email" required>
            </div>
            <div class="form-group">
                <label for="senha">Senha:</label>
                <input type="password" id="senha" name="senha" placeholder="Digite sua senha" required>
            </div>
            <button type="submit">Login</button>
            <?php if (!empty($error)): ?>
                <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
        </form>
        <div class="footer">
            <img src="https://lh3.googleusercontent.com/pw/ABLVV876xRDbRuxOX1OSX2jHTrHAzCQtDyFgk3zno4pY88-EUd3wsayYDYp0JdOACWjLx5qlQK1unqiKOnssmj1GyRIXpibBkIE0EXFBr8FIazwZ4H4qPro=w600-h315-p-k" alt="Footer Image"/>
        </div>
    </div>
</body>
</html>
