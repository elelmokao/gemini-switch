
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiService, type Persona } from "@/services/api.service";

interface ApiKey {
    id: string;
    api_key: string;
    description: string | null;
    user_id: string | null;
    token_used: number;
    created_at: string;
}

export default function PersonaManagePage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loadingApiKeys, setLoadingApiKeys] = useState(true);
    
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [loadingPersonas, setLoadingPersonas] = useState(true);

    const [newPersona, setNewPersona] = useState({
        name: "",
        description: "",
        system_prompt: "",
        model_used: "Gemini-2.0-flash",
        api_key_id: ""
    });


    const roles = [
        {
            name: "Note-Taking Assistant",
            description: "Handles customer queries and support.",
            system_prompt: "You are a helpful customer support agent.",
            model_used: "Gemini-2.0-flash",
        },
        {
            name: "Content Writer",
            description: "Creates engaging blog posts.",
            system_prompt: "You are a creative content writer.",
            model_used: "Gemini-2.0-pro",
        },
        {
            name: "Code Assistant",
            description: "Helps with programming questions.",
            system_prompt: "You are an expert programming assistant.",
            model_used: "Gemini-2.5-flash",
        }
    ];

    const [roleDialogIdx, setRoleDialogIdx] = useState<number | null>(null);

    // Fetch API Keys from backend
    useEffect(() => {
        const fetchApiKeys = async () => {
            try {
                setLoadingApiKeys(true);
                const data = await apiService.getApiKeys();
                setApiKeys(data);
            } catch (error) {
                console.error('Error fetching API keys:', error);
            } finally {
                setLoadingApiKeys(false);
            }
        };

        fetchApiKeys();
    }, []);

    // Fetch Personas from backend
    useEffect(() => {
        const fetchPersonas = async () => {
            try {
                setLoadingPersonas(true);
                const data = await apiService.getPersonas();
                setPersonas(data);
            } catch (error) {
                console.error('Error fetching personas:', error);
            } finally {
                setLoadingPersonas(false);
            }
        };

        fetchPersonas();
    }, []);

    const handleAdd = async () => {
        if (!newPersona.name.trim() || !newPersona.system_prompt.trim() || !newPersona.model_used.trim() || !newPersona.api_key_id.trim()) return;
        
        try {
            const createdPersona = await apiService.createPersona({
                name: newPersona.name.trim(),
                description: newPersona.description.trim() ? newPersona.description.trim() : null,
                system_prompt: newPersona.system_prompt.trim(),
                model_used: newPersona.model_used.trim(),
                api_key_id: newPersona.api_key_id.trim()
            });
            
            setPersonas([...personas, createdPersona]);
            setNewPersona({ name: "", description: "", system_prompt: "", model_used: "Gemini-2.0-flash", api_key_id: "" });
        } catch (error) {
            console.error('Error creating persona:', error);
            alert('Failed to create persona. Please try again.');
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await apiService.deletePersona(id);
            setPersonas(personas.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting persona:', error);
            alert('Failed to delete persona. Please try again.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Persona Management</h1>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add Persona</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Default Persona Options: Each role as a Button, Dialog shows info */}
                    <div className="mb-4">
                        <div className="font-semibold mb-2">Quick Fill Default Personas:</div>
                        <div className="flex flex-wrap gap-2">
                            {roles.map((persona, idx) => (
                                <Dialog key={idx} open={roleDialogIdx === idx} onOpenChange={open => setRoleDialogIdx(open ? idx : null)}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">{persona.name}</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>{persona.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="mb-2 text-sm text-muted-foreground">{persona.description}</div>

                                        <div className="grid gap-4">
                                            <div className="grid gap-3">
                                                <Label htmlFor="name-1">System Prompt</Label>
                                                <div className="p-2 bg-muted rounded font-mono">{persona.system_prompt}</div>
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="username-1">Model</Label>
                                                <div className="p-2 bg-muted rounded">{persona.model_used}</div>
                                            </div>
                                        </div>
                                        <DialogFooter className="flex gap-2">
                                            <Button
                                                onClick={() => {
                                                    setNewPersona({ ...persona, api_key_id: apiKeys[0]?.id || "" });
                                                    setRoleDialogIdx(null);
                                                }}
                                            >Apply</Button>
                                            <Button variant="outline" onClick={() => setRoleDialogIdx(null)}>Cancel</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>
                    </div>

                    {/* Custom Add Persona Form */}
                    <div className="font-semibold mb-2">Add Custom Persona:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                            placeholder="Persona Role"
                            value={newPersona.name}
                            onChange={e => setNewPersona({ ...newPersona, name: e.target.value })}
                        />
                        <Input
                            placeholder="Description (optional)"
                            value={newPersona.description}
                            onChange={e => setNewPersona({ ...newPersona, description: e.target.value })}
                        />
                    </div>
                    <Textarea
                        placeholder="System Prompt"
                        value={newPersona.system_prompt}
                        onChange={e => setNewPersona({ ...newPersona, system_prompt: e.target.value })}
                        className="mb-4"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Select value={newPersona.model_used} onValueChange={value => setNewPersona({ ...newPersona, model_used: value })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Gemini-2.0-flash">Gemini-2.0-flash</SelectItem>
                                <SelectItem value="Gemini-2.0-pro">Gemini-2.0-pro</SelectItem>
                                <SelectItem value="Gemini-2.5-flash">Gemini-2.5-flash</SelectItem>
                                <SelectItem value="Gemini-2.5-pro">Gemini-2.5-pro</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={newPersona.api_key_id}
                            onValueChange={value => setNewPersona({ ...newPersona, api_key_id: value })}
                            disabled={loadingApiKeys}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={loadingApiKeys ? "Loading API Keys..." : "Select API Key"} />
                            </SelectTrigger>
                            <SelectContent>
                                {apiKeys.length === 0 ? (
                                    <SelectItem value="no-keys" disabled>No API Keys Available</SelectItem>
                                ) : (
                                    apiKeys.map((key) => (
                                        <SelectItem key={key.id} value={key.id}>
                                            {key.description || `API Key (${key.api_key.slice(0, 8)}...)`}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={handleAdd}
                        disabled={
                            !newPersona.name.trim() ||
                            !newPersona.system_prompt.trim() ||
                            !newPersona.model_used.trim() ||
                            !newPersona.api_key_id.trim()
                        }
                    >
                        Add Persona
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Personas List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingPersonas ? (
                        <div className="text-muted-foreground flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            <span>Loading personas...</span>
                        </div>
                    ) : personas.length === 0 ? (
                        <div className="text-muted-foreground">No personas.</div>
                    ) : (
                        <div className="space-y-4">
                            {personas.map((persona) => (
                                <Card key={persona.id} className="bg-background">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-lg">{persona.name}</span>
                                            <Button variant="destructive" size="sm" onClick={() => handleRemove(persona.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-1">Description: {persona.description ?? <span className="italic">NULL</span>}</div>
                                        <div className="text-sm text-muted-foreground mb-1">System Prompt: <span className="font-mono">{persona.system_prompt}</span></div>
                                        <div className="text-sm text-muted-foreground mb-1">Model Used: <span className="font-semibold">{persona.model_used}</span></div>
                                        <div className="text-sm text-muted-foreground">API Key ID: <span className="font-mono">{persona.api_key_id}</span></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
