import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ApiManageCard() {
	const [apiKeys, setApiKeys] = useState<string[]>(["demo-key-1", "demo-key-2"]);
	const [newKey, setNewKey] = useState("");

	const handleAdd = () => {
		if (newKey.trim() && !apiKeys.includes(newKey.trim())) {
			setApiKeys([...apiKeys, newKey.trim()]);
			setNewKey("");
		}
	};

	const handleRemove = (key: string) => {
		setApiKeys(apiKeys.filter(k => k !== key));
	};

	return (
		<Card className="max-w-md w-full mx-auto">
			<CardHeader>
				<CardTitle>API Key Management</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{apiKeys.length === 0 && <div className="text-muted-foreground">No API keys.</div>}
					{apiKeys.map((key) => (
						<div key={key} className="flex items-center gap-2 border rounded px-2 py-1">
							<span className="flex-1 truncate">{key}</span>
							<Button variant="destructive" size="sm" onClick={() => handleRemove(key)}>
								Remove
							</Button>
						</div>
					))}
				</div>
			</CardContent>
			<CardFooter className="flex gap-2">
				<Input
					placeholder="Enter new API key"
					value={newKey}
					onChange={e => setNewKey(e.target.value)}
					className="flex-1"
				/>
				<Button onClick={handleAdd} disabled={!newKey.trim() || apiKeys.includes(newKey.trim())}>
					Add
				</Button>
			</CardFooter>
		</Card>
	);
}
