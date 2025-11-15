# Guia de Integração Frontend-Backend

## 📋 Requisitos

### Backend (SOSComidaService)
O backend deve implementar os seguintes endpoints:

#### Autenticação (`/auth`)
- `POST /auth/login` - Login de usuário
- `POST /auth/register/usuario` - Registro de usuário comum
- `POST /auth/register/instituicao` - Registro de instituição
- `GET /auth/me` - Dados do usuário autenticado
- `POST /auth/refresh` - Renovar token (opcional)
- `PUT /auth/profile` - Atualizar perfil
- `POST /auth/2fa/setup` - Configurar 2FA
- `POST /auth/2fa/enable` - Ativar 2FA
- `POST /auth/2fa/disable` - Desativar 2FA
- `POST /auth/2fa/verify` - Verificar código 2FA

#### Campanhas (`/campanhas`)
- `GET /campanhas` - Listar campanhas (query: ?status=ativa)
- `GET /campanhas/:id` - Detalhes de uma campanha
- `POST /campanhas` - Criar campanha (multipart/form-data)
- `PUT /campanhas/:id` - Atualizar campanha
- `DELETE /campanhas/:id` - Deletar campanha
- `POST /campanhas/:id/voluntariar` - Voluntariar-se
- `GET /campanhas/:id/voluntarios` - Listar voluntários
- `POST /campanhas/:id/doar-pix` - Doar via PIX
- `POST /campanhas/:id/doar-itens` - Doar itens

#### Denúncias (`/denuncias`)
- `POST /denuncias/voluntario` - Denunciar voluntário

## 🔧 Configuração Backend (.NET)

### 1. CORS

**Program.cs:**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Adicionar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001"
                // Adicionar domínio de produção quando houver
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddControllers();
// Outros serviços...

var app = builder.Build();

// Usar CORS
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

### 2. Estrutura de Resposta Esperada

#### Login (`POST /auth/login`)
**Request:**
```json
{
  "email": "usuario@email.com",
  "senha": "senha123",
  "codigo2fa": "123456" // opcional
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_aqui", // opcional
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipo": "usuario",
    "twoFactorEnabled": false,
    "govBrLinked": false,
    "dataCriacao": "2025-01-15T00:00:00.000Z"
  },
  "requires2FA": false // se true, front chama /auth/2fa/verify
}
```

#### Registro Usuario (`POST /auth/register/usuario`)
**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "Senha@123",
  "confirmarSenha": "Senha@123",
  "telefone": "(11) 98765-4321",
  "endereco": "Rua Exemplo, 123",
  "cidade": "São Paulo",
  "cpf": "123.456.789-00"
}
```

**Response:** Igual ao login (token + usuario)

#### Listar Campanhas (`GET /campanhas`)
**Response:**
```json
[
  {
    "id": 1,
    "titulo": "Ajuda às Vítimas das Enchentes",
    "descricao": "Campanha para arrecadar...",
    "localizacao": "São Paulo - SP",
    "metaVoluntarios": 50,
    "metaDoacoes": 100000,
    "arrecadado": 45000,
    "imagem": "https://storage.exemplo.com/campanha1.jpg",
    "status": "ativa",
    "dataCriacao": "2025-01-10T00:00:00.000Z",
    "dataFim": null,
    "numVoluntarios": 23,
    "progresso": 45,
    "solicitante": {
      "id": 5,
      "nome": "Maria Santos",
      "tipo": "usuario"
    },
    "instituicaoDelegada": null
  }
]
```

### 2. Autenticação JWT

**Instalar pacotes:**
```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
```

**Program.cs:**
```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Configurar JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
            )
        };
    });
```

**appsettings.json:**
```json
{
  "Jwt": {
    "Key": "sua-chave-secreta-super-segura-com-pelo-menos-32-caracteres",
    "Issuer": "SOSComidaAPI",
    "Audience": "SOSComidaFront",
    "ExpiresInMinutes": 15,
    "RefreshExpiresInDays": 7
  }
}
```

**Controller com [Authorize]:**
```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CampanhasController : ControllerBase
{
    [HttpGet("me")]
    public IActionResult GetMyCampanhas()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        // ...
    }
}
```

### 3. Upload de Arquivos

**Controller (CampanhasController.cs):**
```csharp
[HttpPost]
public async Task<IActionResult> CreateCampanha([FromForm] CreateCampanhaDto dto)
{
    if (dto.Imagem != null)
    {
        // Validar arquivo
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(dto.Imagem.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { error = "Formato de imagem inválido" });
        }

        // Salvar arquivo (local ou cloud storage)
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine("wwwroot/uploads", fileName);
        
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.Imagem.CopyToAsync(stream);
        }
        
        dto.ImagemUrl = $"/uploads/{fileName}";
    }

    var campanha = await _campanhaService.CreateAsync(dto);
    return Ok(campanha);
}

// DTO
public class CreateCampanhaDto
{
    public string Titulo { get; set; }
    public string Descricao { get; set; }
    public string Localizacao { get; set; }
    public int MetaVoluntarios { get; set; }
    public decimal MetaDoacoes { get; set; }
    public IFormFile? Imagem { get; set; }
    public string? ImagemUrl { get; set; }
}
```

**Program.cs (configurar arquivos estáticos):**
```csharp
app.UseStaticFiles(); // Antes de UseRouting()
```

## 🚀 Executar Localmente

### Backend (.NET)
```bash
cd SOSComidaService

# Restaurar pacotes
dotnet restore

# Configurar connection string e JWT
# Editar appsettings.Development.json

# Criar/atualizar banco de dados
dotnet ef migrations add InitialCreate
dotnet ef database update

# Rodar aplicação (porta 5000/5001)
dotnet run

# Ou usar watch para hot reload
dotnet watch run
```

**appsettings.Development.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SOSComida;User Id=sa;Password=SuaSenha123;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "sua-chave-secreta-super-segura-com-pelo-menos-32-caracteres",
    "Issuer": "SOSComidaAPI",
    "Audience": "SOSComidaFront",
    "ExpiresInMinutes": 15,
    "RefreshExpiresInDays": 7
  },
  "AllowedHosts": "*"
}
```

### Frontend
```bash
cd SOSComidaFront
pnpm install
pnpm dev
```

O frontend estará em `http://localhost:3000` e apontará para o backend em `http://localhost:5000/api` (conforme `.env.local`).

## 🌐 Deploy Produção

### Backend
1. Deploy em serviço cloud (Heroku, Railway, AWS, Google Cloud, Azure)
2. Configurar variáveis de ambiente:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CORS_ORIGIN` (URL do frontend em produção)
3. Anotar URL final (ex: `https://api.soscomida.com`)

### Frontend (Vercel)
1. Fazer push do código para GitHub/GitLab
2. Conectar repositório no Vercel
3. Adicionar variável de ambiente:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://api.soscomida.com/api`
4. Deploy

## 🔐 Refresh Token (Opcional)

Se o backend implementar `POST /auth/refresh`, o interceptor no frontend tentará renovar o token automaticamente antes de redirecionar para login quando receber 401.

**Service (JwtService.cs):**
```csharp
public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(Usuario usuario)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])
        );
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Role, usuario.Tipo.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["Jwt:ExpiresInMinutes"])
            ),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"],
                ValidateLifetime = false // Não validar expiração aqui
            };

            return tokenHandler.ValidateToken(token, validationParameters, out _);
        }
        catch
        {
            return null;
        }
    }
}
```

**Controller (AuthController.cs):**
```csharp
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly JwtService _jwtService;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var usuario = await _usuarioRepository.GetByEmailAsync(dto.Email);
        
        if (usuario == null || !VerifyPassword(dto.Senha, usuario.SenhaHash))
        {
            return Unauthorized(new { error = "Email ou senha inválidos" });
        }

        // Verificar se 2FA está ativo
        if (usuario.TwoFactorEnabled && string.IsNullOrEmpty(dto.Codigo2fa))
        {
            return Ok(new { requires2FA = true });
        }

        var token = _jwtService.GenerateToken(usuario);
        var refreshToken = _jwtService.GenerateRefreshToken();

        // Salvar refresh token no banco
        await _refreshTokenRepository.SaveAsync(new RefreshToken
        {
            Token = refreshToken,
            UsuarioId = usuario.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        });

        return Ok(new
        {
            token,
            refreshToken,
            usuario = MapToDto(usuario)
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        var storedToken = await _refreshTokenRepository.GetByTokenAsync(dto.RefreshToken);

        if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow || storedToken.IsRevoked)
        {
            return Unauthorized(new { error = "Refresh token inválido ou expirado" });
        }

        var usuario = await _usuarioRepository.GetByIdAsync(storedToken.UsuarioId);
        
        if (usuario == null)
        {
            return Unauthorized(new { error = "Usuário não encontrado" });
        }

        // Gerar novos tokens
        var newToken = _jwtService.GenerateToken(usuario);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        // Revogar token antigo
        storedToken.IsRevoked = true;
        await _refreshTokenRepository.UpdateAsync(storedToken);

        // Salvar novo refresh token
        await _refreshTokenRepository.SaveAsync(new RefreshToken
        {
            Token = newRefreshToken,
            UsuarioId = usuario.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        });

        return Ok(new
        {
            token = newToken,
            refreshToken = newRefreshToken
        });
    }
}

// DTOs
public class LoginDto
{
    public string Email { get; set; }
    public string Senha { get; set; }
    public string? Codigo2fa { get; set; }
}

public class RefreshTokenDto
{
    public string RefreshToken { get; set; }
}

// Entity
public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; }
    public int UsuarioId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRevoked { get; set; }
}
```

## ⚠️ Checklist de Integração

- [ ] Backend rodando em `http://localhost:5000`
- [ ] CORS configurado para aceitar `http://localhost:3000`
- [ ] Endpoints `/auth/login` e `/auth/register/*` implementados
- [ ] Endpoints `/campanhas` implementados
- [ ] JWT implementado e validado
- [ ] Status 401 retornado quando token inválido
- [ ] Frontend com `.env.local` configurado
- [ ] Testar login e obter token
- [ ] Testar endpoints autenticados com token
- [ ] Testar upload de imagem em campanhas

## 📝 Exemplo de Teste

**PowerShell:**
```powershell
# Testar login
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"usuario@email.com","senha":"senha123"}'

# Testar endpoint autenticado
$token = "SEU_TOKEN_AQUI"
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }

# Testar listagem de campanhas
Invoke-RestMethod -Uri "http://localhost:5000/api/campanhas" -Method GET
```

**Bash/curl:**
```bash
# Testar login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@email.com","senha":"senha123"}'

# Testar endpoint autenticado
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Testar listagem de campanhas
curl -X GET http://localhost:5000/api/campanhas
```

## 🆘 Troubleshooting

### Erro CORS
- Verificar se backend tem CORS configurado
- Verificar se origem está permitida
- Verificar headers permitidos incluem `Authorization`

### Token não sendo enviado
- Verificar se token está no localStorage
- Abrir DevTools → Application → Local Storage
- Verificar se interceptor está funcionando

### 401 Unauthorized
- Verificar se token está válido (não expirou)
- Verificar formato: `Bearer <token>`
- Verificar se backend está validando corretamente

### Backend não recebe dados
- Verificar Content-Type correto
- Para JSON: `application/json`
- Para upload: `multipart/form-data`
