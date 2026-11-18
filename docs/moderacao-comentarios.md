# Como moderar comentários do blog

1. No editor do Lovable, abra **Cloud → Database → Tables → blog_comments**.
2. Filtre por `status = pending`.
3. Para publicar, altere `status` para `approved`. Para recusar, use `rejected` (ou apague a linha).
4. O comentário aprovado aparece no artigo na próxima vez que a página for carregada.

Só quem tem acesso de edição ao projeto vê esse painel. Visitantes nunca veem comentários pendentes ou recusados.
