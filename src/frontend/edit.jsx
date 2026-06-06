import React, { useState, useRef, useEffect, useCallback } from 'react';
import ForgeReconciler, { Box, Text, ErrorMessage, Button, Label, Textfield, HelperMessage, Stack, SectionMessage, xcss, Heading } from '@forge/react';
import { CustomFieldEdit } from '@forge/react/jira';
import { view } from '@forge/bridge';
import { VALIDATION_STATUS } from './constants';

const roundedCardStyle = xcss({
  backgroundColor: 'color.background.accent.blue.subtler',
  padding: 'space.300',
  borderStyle: 'solid',
  borderWidth: 'border.width',
  borderColor: 'color.border',
  borderRadius: 'radius.large', 
});

const Edit = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    const [promoCode, setPromoCode] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [errors, setErrors] = useState({ promoCode: '', companyName: '' });
    const [validationResult, setValidationResult] = useState(null); 

    const onSubmit = useCallback(async() => {
        await view.submit(promoCode)
    }, [view, promoCode]);

    const validate = async () => {
        setIsLoading(true);
        setValidationResult(null);
        setErrors({ promoCode: '', companyName: '' }); 

        const currentPromo = promoCode.trim();
        const currentCompany = companyName.trim();

        if (currentPromo === '') {
            setErrors(prev => ({ ...prev, promoCode: 'Promo code is required.' }));
            setIsLoading(false);
            return;
        }
        if (currentCompany === '') {
            setErrors(prev => ({ ...prev, companyName: 'Company name is required.' }));
            setIsLoading(false);
            return;
        }

        try {
            const BASE_URL = "https://globe-api-staging-732869802745.europe-west1.run.app/public/promo-codes/validate";
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'W4?2ESGt@*hmG7/;G&uWGKGN@/ZZ3z'
                },
                body: JSON.stringify({
                    promoCode: currentPromo,
                    companyName: currentCompany
                })
            });

            if (!response.ok) throw new Error("Validation failed.");

            const data = await response.json();
            const status = data.isExact ? VALIDATION_STATUS.SUCCESS : VALIDATION_STATUS.WARNING;
            setValidationResult(status);

        } catch (error) {
            setValidationResult(VALIDATION_STATUS.FAILURE);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromoCodeInputChange = (e) => {
        setValidationResult(null); 
        setPromoCode(e.target.value);
    };

    const handleCompanyInputChange = (e) => {
        setValidationResult(null);
        setCompanyName(e.target.value);
    };

    return (
        <CustomFieldEdit onSubmit={onSubmit} hideActionButtons>     
            <Box xcss={roundedCardStyle}>
                <Stack space="space.200">
                    <Box>
                        <Heading size='large'>Promo Code Checker - Test</Heading>
                        <Text>Use this section to verify your promo code before submitting your application. 
                            Leave these fields empty if you do not want to use a promo code.
                        </Text>
                    </Box>
                    <Box>
                        <Label labelFor="promoCode">Promo Code</Label>
                        <Textfield
                            placeholder="Enter your promo code"
                            isRequired
                            value={promoCode}
                            onChange={handlePromoCodeInputChange}
                            isInvalid={!!errors.promoCode}
                        />
                        {errors.promoCode && (
                            <ErrorMessage appearance="error">{errors.promoCode}</ErrorMessage>
                        )}
                    </Box>
                    <Box>
                        <Label labelFor="companyName">Company Name</Label>
                        <Textfield
                            placeholder="Enter your company name"
                            isRequired
                            value={companyName}
                            onChange={handleCompanyInputChange}
                            isInvalid={!!errors.companyName}
                        />
                        {errors.companyName && (
                            <ErrorMessage appearance="error">{errors.companyName}</ErrorMessage>
                        )}
                        <HelperMessage>
                            Enter your complete registered company or business name.
                        </HelperMessage>
                    </Box>
                    <Box>
                        { validationResult === VALIDATION_STATUS.SUCCESS && 
                            <SectionMessage appearance='success'>Promo code is valid.</SectionMessage>
                        }
                        { validationResult === VALIDATION_STATUS.FAILURE && 
                            <SectionMessage appearance='error'>
                                The promo code you entered is invalid or expired. Please replace it with the correct promo code or remove it.
                            </SectionMessage>
                        }
                        { validationResult === VALIDATION_STATUS.WARNING && 
                            <SectionMessage appearance='warning'>
                                The Promo code you entered is valid but your company name does not exactly match with our records. 
                                You can still use this promo code but this application will require a manual review by our team.
                            </SectionMessage>
                        }
                    </Box>
                    <Box>
                        <Button onClick={validate} 
                            appearance="primary" 
                            type="button"
                            isDisabled={promoCode.trim() === '' || companyName.trim() === '' || isLoading}
                            isLoading={isLoading}
                        >
                            Validate Promo Code
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </CustomFieldEdit>
    );
};

ForgeReconciler.render(
  <React.StrictMode>
    <Edit />
  </React.StrictMode>
);