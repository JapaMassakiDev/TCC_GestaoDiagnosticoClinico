import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import DiagnosisCard from "../../components/DiagnosisCard";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../contexts/AuthContext";
import {
  listDiagnosisGroups,
  renameDiagnosisGroup
} from "../../services/diagnosisService";

export default function DiagnosisScreen({ navigation }) {
  const { user } = useAuth();

  const [groups, setGroups] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    const data = await listDiagnosisGroups();
    setGroups(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function toggleDiagnosis(item) {
    setSelected((current) =>
      current.some((d) => d.id === item.id)
        ? current.filter((d) => d.id !== item.id)
        : [...current, item]
    );
  }

  function startRename(group) {
    setEditingGroup(group.id);
    setNewName(group.name);
  }

  async function saveRename(groupId) {
    if (!newName.trim()) return;
    await renameDiagnosisGroup(groupId, newName.trim());
    setEditingGroup(null);
    load();
  }

  function handleShare() {
    if (!selectMode) {
      setSelectMode(true);
      return;
    }

    if (!selected.length) {
      Alert.alert("Compartilhar", "Selecione pelo menos um diagnóstico.");
      return;
    }

    navigation.navigate("ShareQr", { diagnoses: selected });
  }

  return (
    <Screen>
      <Text className="mt-2 text-3xl font-black text-ink">Diagnósticos</Text>
      <Text className="mt-2 leading-6 text-slate-500">
        Organize seus diagnósticos por grupos e compartilhe com segurança por QR Code.
      </Text>

      <View className="my-5 flex-row gap-3">
        {user.role === "paciente" && (
          <View className="flex-1">
            <PrimaryButton
              title={selectMode ? `Gerar QR (${selected.length})` : "Compartilhar"}
              onPress={handleShare}
              icon={<Ionicons name="share-social-outline" size={20} color="#FFFFFF" />}
            />
          </View>
        )}

        {user.role === "medico" && (
          <View className="flex-1">
            <PrimaryButton
              title="Escanear"
              onPress={() => navigation.navigate("Scanner")}
              icon={<Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />}
            />
          </View>
        )}
      </View>

      {selectMode && (
        <Pressable
          onPress={() => {
            setSelectMode(false);
            setSelected([]);
          }}
          className="mb-4 self-start rounded-xl bg-slate-100 px-3 py-2"
        >
          <Text className="font-semibold text-slate-600">Cancelar seleção</Text>
        </Pressable>
      )}

      {groups.map((group) => (
        <View key={group.id} className="mb-5">
          <View className="mb-3 flex-row items-center justify-between">
            {editingGroup === group.id ? (
              <View className="flex-1 flex-row items-center">
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  className="mr-2 flex-1 rounded-xl border border-mint-200 bg-white px-3 py-2 text-ink"
                />
                <Pressable
                  onPress={() => saveRename(group.id)}
                  className="rounded-xl bg-mint-600 p-2"
                >
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <>
                <View className="flex-row items-center">
                  <View
                    style={{ backgroundColor: group.color }}
                    className="mr-3 h-3 w-3 rounded-full"
                  />
                  <Text className="text-xl font-extrabold text-ink">{group.name}</Text>
                  <Text className="ml-2 text-sm text-slate-400">
                    {group.diagnoses.length}
                  </Text>
                </View>

                <Pressable onPress={() => startRename(group)} className="p-2">
                  <Ionicons name="pencil-outline" size={20} color="#4F6A60" />
                </Pressable>
              </>
            )}
          </View>

          {group.diagnoses.map((diagnosis) => (
            <DiagnosisCard
              key={diagnosis.id}
              diagnosis={diagnosis}
              selectable={selectMode}
              selected={selected.some((d) => d.id === diagnosis.id)}
              onPress={() => toggleDiagnosis(diagnosis)}
            />
          ))}
        </View>
      ))}
    </Screen>
  );
}
