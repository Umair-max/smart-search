import RegistrationHeader from "@/components/RegistrationHeader";
import RegistrationText from "@/components/RegistrationText";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppButton from "../../components/AppButton";
import FormInput from "../../components/FormInput";
import ScreenComponent from "../../components/ScreenComponent";
import Typo from "../../components/Typo";
import colors from "../../config/colors";
import { fontS, spacingH, spacingX, spacingY } from "../../config/spacing";
import { forgotSchema } from "../../schemas/schemas";
import { useAuthStore } from "../../store/authStore";
import { ForgotTypes } from "../../types/registerTypes";

function ForgotPassword() {
  const { forgotPassword, loading } = useAuthStore();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotTypes>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {},
  });

  const onSubmit = (data: ForgotTypes) => {
    forgotPassword(data, () => {});
  };

  return (
    <ScreenComponent style={{ backgroundColor: "white" }}>
      <RegistrationHeader />
      <View style={styles.container}>
        <RegistrationText
          title={"Forgot Password"}
          body={"Enter your email to reset your password"}
        />
        <FormInput
          control={control}
          name="email"
          label={""}
          placeholder={"Enter your email"}
          index={0}
          inputMode="email"
          inputProps={{
            autoCapitalize: "none",
            keyboardType: "email-address",
          }}
          image={require("@/assets/images/email.png")}
        />

        <TouchableOpacity
          style={[styles.goBack, { alignSelf: "flex-end" }]}
          onPress={() => router.back()}
        >
          <Typo>Go Back?</Typo>
        </TouchableOpacity>

        <AppButton
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          label={"Send"}
        />
      </View>
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginTop: spacingH.registerMarginTop,
    zIndex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: spacingY._35,
    paddingHorizontal: spacingX._20,
  },
  title: {
    color: colors.white,
    fontWeight: "600",
    alignSelf: "center",
    marginTop: "7%",
    marginBottom: spacingY._5,
    fontSize: fontS._28,
  },
  tagLine: {
    color: colors.white,
    fontWeight: "500",
    alignSelf: "center",
    fontSize: fontS._12,
    marginBottom: "32%",
  },
  goBack: {
    padding: spacingX._5,
    marginRight: -spacingX._5,
    marginBottom: "15%",
  },
});

export default ForgotPassword;
