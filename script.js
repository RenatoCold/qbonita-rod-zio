// 1. Configuração de conexão com o Supabase
const SUPABASE_URL = "https://ksjwanjkwjstrybkvjrj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzandhbmprd2pzdHJ5Ymt2anJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDg1MjQsImV4cCI6MjA5Nzg4NDUyNH0.UIZi4OIKBNIQCYFuzd-4VKwVDEQIiBuJiIw-uI7QKZ0";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Lista de vendedoras da sua tia (Coloque os números REAIS aqui)
const vendedoras = [
    "5511999999991", // Vendedora 0
    "5511999999992", // Vendedora 1
    "5511999999993"  // Vendedora 2
];

const mensagemTexto = "Olá! Vi o vestido no Instagram e gostaria de mais informações.";
const mensagemCodificada = encodeURIComponent(mensagemTexto);

// Função Fallback: Atendimento aleatório caso o banco caia ou demore
function redirecionarFallback() {
    console.log("Banco instável. Ativando redirecionamento de segurança (aleatório)...");
    const indiceAleatorio = Math.floor(Math.random() * vendedoras.length);
    window.location.replace(`https://wa.me/${vendedoras[indiceAleatorio]}?text=${mensagemCodificada}`);
}

// 4. Função principal do Rodízio com proteção de Timeout
async function rodizioInteligente() {
    // Cria um timer que cancela a requisição se demorar mais de 3 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
        // Busca a linha no banco passando o sinal de cancelamento por tempo
        const { data, error } = await supabase
            .from('controle_rodizio')
            .select('ultimo_indice')
            .eq('id', 1)
            .single(), { abortSignal: controller.signal };

        clearTimeout(timeoutId); // Banco respondeu rápido, cancela o temporizador de erro

        if (error) throw error;

        let ultimoIndice = data.ultimo_indice;
        let proximoIndice = (ultimoIndice + 1) % vendedoras.length;
        const numeroEscolhido = vendedoras[proximoIndice];

        // Atualiza o banco com o novo índice
        await supabase
            .from('controle_rodizio')
            .update({ ultimo_indice: proximoIndice })
            .eq('id', 1);

        window.location.replace(`https://wa.me/${numeroEscolhido}?text=${mensagemCodificada}`);

    } catch (err) {
        // Entra aqui se o Supabase der erro OU se estourar o tempo de 3 segundos
        clearTimeout(timeoutId);
        redirecionarFallback();
    }
}

window.onload = function() {
    setTimeout(rodizioInteligente, 2500); 
};