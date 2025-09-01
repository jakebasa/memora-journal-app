import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AiChatButton } from '@/components/ui/ai-chat-button';

export function GlobalChatButton() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    // Don't show chat button on these pages
    const excludedPaths = ['/login', '/signup', '/settings'];
    const shouldShowChat =
        isAuthenticated && !excludedPaths.includes(location.pathname);

    if (!shouldShowChat) {
        return null;
    }

    return <AiChatButton />;
}
