import { useState, useEffect } from "react";
import axios from "axios";
import { RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function ApiManageCard() {
	// Simulate reload (replace with real API call as needed)
	const [apiKeys, setApiKeys] = useState<{
		api_key: string;
		description: string | null;
		token_used: number;
	}[]>([]);
	const [newKey, setNewKey] = useState("");
	const [newDesc, setNewDesc] = useState("");
	const [loading, setLoading] = useState(false);

	const fetchApiKeys = async () => {
		setLoading(true);
		try {
			const res = await axios.get("http://localhost:3000/api_keys");
			setApiKeys(res.data);
		} catch (err) {
			// Optionally handle error
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchApiKeys();
	}, []);

	const handleReload = () => {
		fetchApiKeys();
	};

	const handleAdd = async () => {
		const trimmedKey = newKey.trim();
		console.log("test");
		if (!trimmedKey || apiKeys.some(k => k.api_key === trimmedKey)) return;
		setLoading(true);
		try {
			await axios.post("http://localhost:3000/api_keys", {
				api_key: trimmedKey,
				description: newDesc.trim() ? newDesc.trim() : null,
				user_id: "11111111-1111-1111-1111-111111111111",
				token_used: 0,
			});
			setNewKey("");
			setNewDesc("");
			fetchApiKeys();
		} catch (err) {
			// Optionally handle error
		} finally {
			setLoading(false);
		}
	};

	const handleRemove = async (key: string) => {
		setLoading(true);
		try {
			await axios.delete("http://localhost:3000/api_keys", { data: { api_key: key } });
			fetchApiKeys();
		} catch (err) {
			// Optionally handle error
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="max-w-md w-full mx-auto relative">
			{loading && (
				<div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
					{/* Use shadcn Spinner UI */}
					<Spinner className="w-8 h-8 text-gray-500" />
				</div>
			)}
			<CardHeader className="flex items-center justify-between">
				<div className="flex items-center w-full">
					<CardTitle className="flex-1">API Key Management</CardTitle>
					<Button variant="ghost" size="icon" onClick={handleReload} aria-label="Reload API keys" disabled={loading}>
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
								<Button variant="destructive" size="sm" onClick={() => handleRemove(item.api_key)} disabled={loading}>
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
							disabled={loading}
						/>
						<Input
							placeholder="Description (optional)"
							value={newDesc}
							onChange={e => setNewDesc(e.target.value)}
							className="w-full"
							disabled={loading}
						/>
						<Button
							onClick={handleAdd}
							disabled={
								loading || !newKey.trim() || apiKeys.some(k => k.api_key === newKey.trim())
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
