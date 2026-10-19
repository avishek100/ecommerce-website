<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Shop structure
- All pages share ShopShell and ShopProvider at the root so navigation and in-session cart, wishlist, address and profile selections remain consistent; account pages are frontend-only until real account services are requested.
- Shopping and account menu destinations use separate static leaf routes with page-specific metadata, so each page can be opened directly.
