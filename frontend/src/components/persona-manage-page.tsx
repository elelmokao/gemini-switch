import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PersonaManagePage() {
    const [personas, setPersonas] = useState<{
        name: string;
        description: string | null;
        system_prompt: string;
        model_used: string;
        api_key_id: string;
    }[]>([]);

    const [newPersona, setNewPersona] = useState({
        name: "",
        description: "",
        system_prompt: "",
        model_used: "",
        api_key_id: ""
    });

    const handleAdd = () => {
        if (!newPersona.name.trim() || !newPersona.system_prompt.trim() || !newPersona.model_used.trim() || !newPersona.api_key_id.trim()) return;
        setPersonas([
            ...personas,
            {
                name: newPersona.name.trim(),
                description: newPersona.description.trim() ? newPersona.description.trim() : null,
                system_prompt: newPersona.system_prompt.trim(),
                model_used: newPersona.model_used.trim(),
                api_key_id: newPersona.api_key_id.trim()
            }
        ]);
        setNewPersona({ name: "", description: "", system_prompt: "", model_used: "", api_key_id: "" });
    };

    const handleRemove = (idx: number) => {
        setPersonas(personas.filter((_, i) => i !== idx));
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Persona Management</h1>
            <div className="mb-8 p-4 border rounded-lg bg-background">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                        placeholder="Persona Name"
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
                    <Input
                        placeholder="Model Used"
                        value={newPersona.model_used}
                        onChange={e => setNewPersona({ ...newPersona, model_used: e.target.value })}
                    />
                    <Input
                        placeholder="API Key ID"
                        value={newPersona.api_key_id}
                        onChange={e => setNewPersona({ ...newPersona, api_key_id: e.target.value })}
                    />
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
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-4">Personas List</h2>
                {personas.length === 0 ? (
                    <div className="text-muted-foreground">No personas.</div>
                ) : (
                    <div className="space-y-4">
                        {personas.map((persona, idx) => (
                            <div key={idx} className="border rounded-lg p-4 bg-background">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-lg">{persona.name}</span>
                                    <Button variant="destructive" size="sm" onClick={() => handleRemove(idx)}>
                                        Delete
                                    </Button>
                                </div>
                                <div className="text-sm text-muted-foreground mb-1">Description: {persona.description ?? <span className="italic">NULL</span>}</div>
                                <div className="text-sm text-muted-foreground mb-1">System Prompt: <span className="font-mono">{persona.system_prompt}</span></div>
                                <div className="text-sm text-muted-foreground mb-1">Model Used: <span className="font-semibold">{persona.model_used}</span></div>
                                <div className="text-sm text-muted-foreground">API Key ID: <span className="font-mono">{persona.api_key_id}</span></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
