﻿// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.AspNetCore.Http;
using Model.Options;
using Model.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace API.Authentication
{
    public class SAML2IdentityProvider : IFederatedIdentityProvider
    {
        readonly SAML2AuthenticationOptions options;
        readonly ILogger<SAML2IdentityProvider> logger;

        public SAML2IdentityProvider(
            IOptions<SAML2AuthenticationOptions> options,
            ILogger<SAML2IdentityProvider> logger
            )
        {
            this.options = options.Value;
            this.logger = logger;
        }

        public IScopedIdentity GetIdentity(HttpContext context)
        {
            var mapping = options.Headers.ScopedIdentity;
            var headers = context.Request.Headers;

            logger.LogInformation($"SAML2 mapping: {mapping}");

            foreach (var header in headers)
            {
                logger.LogInformation($"SAML2 header information: key '{header.Key}', value '{header.Value}'");
            }

            if (!headers.TryGetValue(mapping, out var scoped) || string.IsNullOrWhiteSpace(scoped.ToString()))
            {
                throw new LeafAuthenticationException($"{mapping} header not found, no scoped identity available");
            }

            var id = new SAML2ScopedIdentity(scoped);
            return id;
        }
    }
}
