import { FormScaffold, formStyles } from "@/components/FormScaffold";
import { STATUS_OPTIONS } from "@/lib/buyer";
import { useBuyer } from "@/lib/buyerProfile";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileEditScreen() {
  const { profile, saveProfile } = useBuyer();
  const [name, setName] = useState(profile.name);
  const [status, setStatus] = useState(profile.status);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    if (!name.trim()) {
      setError("Add your name so dealers know who you are.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveProfile({
        name: name.trim(),
        status: status.trim(),
        location: location.trim(),
        bio: bio.trim(),
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormScaffold
      title="Edit profile"
      onClose={() => router.back()}
      footer={
        <TouchableOpacity style={formStyles.primaryBtn} onPress={onSave} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={formStyles.primaryLabel}>Save</Text>}
        </TouchableOpacity>
      }
    >
      <Text style={formStyles.label}>Name</Text>
      <TextInput style={formStyles.input} value={name} onChangeText={setName} placeholder="Your name" />

      <Text style={formStyles.label}>Buyer status</Text>
      <View style={formStyles.chips}>
        {STATUS_OPTIONS.map((option) => {
          const on = status === option;
          return (
            <TouchableOpacity
              key={option}
              style={[formStyles.chip, on && formStyles.chipOn]}
              onPress={() => setStatus(option)}
            >
              <Text style={[formStyles.chipText, on && formStyles.chipTextOn]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TextInput
        style={[formStyles.input, styles.follow]}
        value={status}
        onChangeText={setStatus}
        placeholder="Or write your own"
      />

      <Text style={formStyles.label}>Location</Text>
      <TextInput
        style={formStyles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Los Angeles, CA"
      />

      <Text style={formStyles.label}>About you</Text>
      <TextInput
        style={[formStyles.input, formStyles.textarea]}
        value={bio}
        onChangeText={setBio}
        placeholder="What you're looking for, timeline, must-haves…"
        multiline
      />
      {error ? <Text style={formStyles.error}>{error}</Text> : null}
    </FormScaffold>
  );
}

const styles = StyleSheet.create({
  follow: {
    marginTop: 10,
  },
});
