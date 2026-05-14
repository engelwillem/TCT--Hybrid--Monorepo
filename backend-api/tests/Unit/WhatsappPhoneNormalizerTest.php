<?php

namespace Tests\Unit;

use App\Support\WhatsappPhoneNormalizer;
use PHPUnit\Framework\TestCase;

class WhatsappPhoneNormalizerTest extends TestCase
{
    public function test_normalizes_supported_international_formats(): void
    {
        $this->assertSame('6281234567890', WhatsappPhoneNormalizer::normalize('+62 812-3456-7890', '62'));
        $this->assertSame('6281234567890', WhatsappPhoneNormalizer::normalize('08 1234 567890', '62'));
        $this->assertSame('61412345678', WhatsappPhoneNormalizer::normalize('+61 412 345 678', '62'));
        $this->assertSame('61412345678', WhatsappPhoneNormalizer::normalize('61412345678', '62'));
        $this->assertSame('6581234567', WhatsappPhoneNormalizer::normalize('+65 8123 4567', '62'));
        $this->assertSame('6581234567', WhatsappPhoneNormalizer::normalize('6581234567', '62'));
        $this->assertSame('447700900123', WhatsappPhoneNormalizer::normalize('+44 7700 900123', '62'));
    }

    public function test_rejects_invalid_inputs(): void
    {
        $this->assertNull(WhatsappPhoneNormalizer::normalize('abcd1234', '62'));
        $this->assertNull(WhatsappPhoneNormalizer::normalize('++++6281234567890', '62'));
        $this->assertNull(WhatsappPhoneNormalizer::normalize('+62--++8123', '62'));
        $this->assertNull(WhatsappPhoneNormalizer::normalize('12345', '62'));
        $this->assertNull(WhatsappPhoneNormalizer::normalize('0000', '62'));
    }

    public function test_uses_configurable_default_country_code_for_local_numbers(): void
    {
        $this->assertSame('6581234567', WhatsappPhoneNormalizer::normalize('08123 4567', '65'));
        $this->assertSame('61412345678', WhatsappPhoneNormalizer::normalize('0412 345 678', '61'));
    }
}

