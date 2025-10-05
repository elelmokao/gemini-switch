import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ApiManageCard() {
	// Simulate reload (replace with real API call as needed)
	const handleReload = () => {
		// Example: just reset token_used to random values
		setApiKeys(apiKeys => apiKeys.map(k => ({
			...k,
			token_used: Math.floor(Math.random() * 200)
		})));
	};
	const [apiKeys, setApiKeys] = useState<{
		api_key: string;
		description: string | null;
		token_used: number;
	}[]>([
		{ api_key: "demo-key-1", description: "First demo key", token_used: 123 },
		{ api_key: "demo-key-2", description: null, token_used: 45 },
	]);

	const [newKey, setNewKey] = useState("");
	const [newDesc, setNewDesc] = useState("");

	const handleAdd = () => {
		const trimmedKey = newKey.trim();
		if (
			trimmedKey &&
			!apiKeys.some(k => k.api_key === trimmedKey)
		) {
			setApiKeys([
				...apiKeys,
				{
					api_key: trimmedKey,
					description: newDesc.trim() ? newDesc.trim() : null,
					token_used: 0, // default value, should be fetched from backend
				},
			]);
			setNewKey("");
			setNewDesc("");
		}
	};

	const handleRemove = (key: string) => {
		setApiKeys(apiKeys.filter(k => k.api_key !== key));
	};

	return (
		<Card className="max-w-md w-full mx-auto">
			<CardHeader className="flex items-center justify-between">
				<div className="flex items-center w-full">
					<CardTitle className="flex-1">API Key Management</CardTitle>
					<Button variant="ghost" size="icon" onClick={handleReload} aria-label="Reload API keys">
						<RotateCcw className="w-5 h-5" />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{apiKeys.length === 0 && <div className="text-muted-foreground">No API keys.</div>}
					{apiKeys.map((item) => (
						<div key={item.api_key} className="flex flex-col gap-1 border rounded px-2 py-1">
							<div className="flex items-center gap-2">
								<span className="flex-1 truncate font-mono">{item.api_key}</span>
								<Button variant="destructive" size="sm" onClick={() => handleRemove(item.api_key)}>
									Delete
								</Button>
							</div>
							<div className="text-xs text-muted-foreground">
								Description: {item.description ?? <span className="italic">NULL</span>}
							</div>
							<div className="text-xs text-muted-foreground">
								Token Used: <span className="font-semibold">{item.token_used}</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
			<CardFooter className="flex flex-col gap-2">
                <div className="flex flex-col gap-2 w-full">
                    <Input
                        placeholder="Enter new API key"
                        value={newKey}
                        onChange={e => setNewKey(e.target.value)}
                        className="w-full"
                    />
                    <Input
                        placeholder="Description (optional)"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        className="w-full"
                    />
                    <Button
                        onClick={handleAdd}
                        disabled={
                            !newKey.trim() || apiKeys.some(k => k.api_key === newKey.trim())
                        }
                        className="self-end"
                    >
                        Add
                    </Button>
                </div>
			</CardFooter>
		</Card>
	);
}
