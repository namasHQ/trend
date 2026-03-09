# Wallet Components

This directory contains all wallet-related UI components for the Solana wallet integration.

## Components

### `wallet-multi-button.tsx`
The main wallet connection button that handles:
- Wallet connection/disconnection
- Displaying wallet address (truncated)
- Dropdown menu with wallet actions (copy address, change wallet, disconnect)
- Connection state management

### `wallet-modal.tsx`
Modal dialog for wallet selection:
- Lists available wallets (installed vs not installed)
- Handles wallet connection flow
- Expandable list for additional wallets
- Proper accessibility with ARIA labels

### `wallet-icon.tsx`
Displays wallet icons with fallback handling

### `wallet-list-item.tsx`
Individual wallet item in the selection modal

### `more-wallets-button.tsx`
Button to expand/collapse additional wallet options

### `no-wallets-found.tsx`
Empty state when no wallets are detected

## Usage

```tsx
import { WalletMultiButton } from '@/components/features/wallet/wallet-multi-button'

// In your component
<WalletMultiButton />
```

The wallet modal is automatically included in the providers and will show when needed.

## Provider Integration

All wallet functionality is integrated through the consolidated provider system in `/src/providers/`.
